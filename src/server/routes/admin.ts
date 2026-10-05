import { Router, Response } from 'express';
import { query } from '../db.js';
import { hashPassword } from '../crypto.js';
import { reviewerAuthMiddleware, requireRoles, ReviewerRequest } from '../middleware/auth.js';
import { logReviewerAudit } from '../middleware/audit.js';

const router = Router();

// Enforce admin role for all admin routes
router.use(reviewerAuthMiddleware);
router.use(requireRoles('admin'));

// Get current system configuration
router.get('/settings', async (_req: ReviewerRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT general_retention_days, sensitive_retention_days, min_reporting_threshold, updated_at
      FROM retention_settings WHERE id = 1
    `);
    res.json({ settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Rotate staff access code
router.post('/rotate-access-code', async (req: ReviewerRequest, res: Response) => {
  try {
    const { new_access_code } = req.body;
    if (!new_access_code || typeof new_access_code !== 'string' || new_access_code.trim().length < 6) {
      return res.status(400).json({ error: 'New access code must be at least 6 characters.' });
    }

    const newHash = await hashPassword(new_access_code.trim());
    await query(`
      UPDATE retention_settings
      SET staff_access_code_hash = $1, updated_at = NOW()
      WHERE id = 1
    `, [newHash]);

    await logReviewerAudit(req.reviewer!.id, 'ACCESS_CODE_ROTATED', null, {
      admin_id: req.reviewer!.id
    });

    res.json({ success: true, message: 'Staff access code rotated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rotate access code' });
  }
});

// Update retention & privacy threshold settings
router.post('/retention-settings', async (req: ReviewerRequest, res: Response) => {
  try {
    const { general_retention_days, sensitive_retention_days, min_reporting_threshold } = req.body;

    const gDays = parseInt(general_retention_days, 10) || 180;
    const sDays = parseInt(sensitive_retention_days, 10) || 90;
    const mThresh = parseInt(min_reporting_threshold, 10) || 5;

    await query(`
      UPDATE retention_settings
      SET general_retention_days = $1,
          sensitive_retention_days = $2,
          min_reporting_threshold = $3,
          updated_at = NOW()
      WHERE id = 1
    `, [gDays, sDays, mThresh]);

    await logReviewerAudit(req.reviewer!.id, 'RETENTION_SETTINGS_UPDATED', null, {
      general_retention_days: gDays,
      sensitive_retention_days: sDays,
      min_reporting_threshold: mThresh
    });

    res.json({ success: true, message: 'Retention settings saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update retention settings' });
  }
});

// Manage Categories
router.get('/categories', async (_req: ReviewerRequest, res: Response) => {
  try {
    const result = await query(`SELECT * FROM categories ORDER BY sort_order ASC`);
    res.json({ categories: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req: ReviewerRequest, res: Response) => {
  try {
    const { id, name, description, icon, is_sensitive, default_reviewer_ids } = req.body;
    if (!id || !name || !description) {
      return res.status(400).json({ error: 'Missing required category fields' });
    }

    await query(`
      INSERT INTO categories (id, name, description, icon, is_sensitive, default_reviewer_ids, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
    `, [id, name, description, icon || 'message-square', !!is_sensitive, JSON.stringify(default_reviewer_ids || [])]);

    res.json({ success: true, message: 'Category created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', async (req: ReviewerRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, is_sensitive, default_reviewer_ids, is_active } = req.body;

    await query(`
      UPDATE categories
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          icon = COALESCE($3, icon),
          is_sensitive = COALESCE($4, is_sensitive),
          default_reviewer_ids = COALESCE($5, default_reviewer_ids),
          is_active = COALESCE($6, is_active)
      WHERE id = $7
    `, [name, description, icon, is_sensitive, default_reviewer_ids ? JSON.stringify(default_reviewer_ids) : null, is_active, id]);

    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Manage Reviewers
router.get('/reviewers', async (_req: ReviewerRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT id, name, email, role, department, title, avatar_url, mfa_enabled, is_active, created_at
      FROM reviewers
      ORDER BY name ASC
    `);
    res.json({ reviewers: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviewers' });
  }
});

// Run Data Retention Purge (Documented deletion process)
router.post('/purge-expired', async (req: ReviewerRequest, res: Response) => {
  try {
    // Find all expired records
    const expiredRes = await query(`
      SELECT id, public_id, is_sensitive FROM feedback
      WHERE retention_expires_at <= NOW() AND is_deleted = false
    `);

    const count = expiredRes.rows.length;

    // Purge records and hashes
    if (count > 0) {
      await query(`
        UPDATE feedback
        SET is_deleted = true,
            deletion_reason = 'Retention policy expiration purge',
            message = '[PURGED ACCORDING TO RETENTION POLICY]',
            subject = '[PURGED]'
        WHERE retention_expires_at <= NOW() AND is_deleted = false
      `);

      // Delete the conversation secret hashes
      const ids = expiredRes.rows.map(r => r.id);
      await query(`DELETE FROM conversation_secrets WHERE feedback_id = ANY($1::int[])`, [ids]);
    }

    await logReviewerAudit(req.reviewer!.id, 'RETENTION_PURGE_EXECUTED', null, {
      records_purged: count,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      records_purged: count,
      message: `Data retention purge executed. ${count} expired records safely purged.`
    });
  } catch (error) {
    console.error('Retention purge error:', error);
    res.status(500).json({ error: 'Failed to execute retention purge' });
  }
});

// Audit Trail (verified to have no secrets or message content)
router.get('/audit-logs', async (_req: ReviewerRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT
        a.id,
        a.action_type,
        a.details_json,
        a.created_at,
        r.name as reviewer_name,
        r.email as reviewer_email
      FROM reviewer_audit_events a
      LEFT JOIN reviewers r ON a.reviewer_id = r.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json({ audit_logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
