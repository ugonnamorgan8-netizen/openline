import { Router, Response } from 'express';
import { query } from '../db.js';
import { verifyPassword } from '../crypto.js';
import { reviewerAuthMiddleware, ReviewerRequest } from '../middleware/auth.js';
import { logReviewerAudit } from '../middleware/audit.js';

const router = Router();

// Reviewer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      `SELECT id, name, email, password_hash, role, department, title, avatar_url, mfa_enabled, is_active
       FROM reviewers
       WHERE LOWER(email) = LOWER($1) AND is_active = true`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid reviewer credentials' });
    }

    const reviewer = result.rows[0];
    const passwordValid = await verifyPassword(password, reviewer.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid reviewer credentials' });
    }

    // Set secure cookie
    res.cookie('openline_reviewer_id', reviewer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    const { password_hash, ...safeReviewer } = reviewer;
    return res.json({
      success: true,
      reviewer: safeReviewer,
      token: reviewer.id // for Authorization header support
    });
  } catch (error) {
    console.error('Reviewer login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('openline_reviewer_id');
  res.json({ success: true, message: 'Logged out' });
});

// Change own password (used on first login or when member wants to update)
router.post('/change-password', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (typeof new_password !== 'string' || new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Fetch current hash
    const result = await query(`SELECT password_hash FROM reviewers WHERE id = $1`, [req.reviewer!.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reviewer not found' });
    }

    const { verifyPassword, hashPassword } = await import('../crypto.js');
    const valid = await verifyPassword(current_password, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await hashPassword(new_password);
    await query(`UPDATE reviewers SET password_hash = $1 WHERE id = $2`, [newHash, req.reviewer!.id]);

    await logReviewerAudit(req.reviewer!.id, 'PASSWORD_CHANGED', null, { self: true });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Current Session Info
router.get('/me', reviewerAuthMiddleware, (req: ReviewerRequest, res: Response) => {
  res.json({ reviewer: req.reviewer });
});

// List Reviewers (for assignment dropdown)
router.get('/list', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, department, title, avatar_url FROM reviewers WHERE is_active = true ORDER BY name ASC`
    );
    res.json({ reviewers: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviewers' });
  }
});

// Reviewer Feedback List (Workspace - Page 5)
router.get('/feedback', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;

    // Role check: Action owner only views assigned improvement tasks
    if (reviewer.role === 'action_owner') {
      return res.status(403).json({
        error: 'Action owners access redacted improvement actions only.'
      });
    }

    const { tab = 'all', category, search, sort = 'newest' } = req.query;

    let baseQuery = `
      SELECT
        f.id,
        f.public_id,
        f.subject,
        f.message,
        f.status,
        f.is_sensitive,
        f.created_at,
        f.updated_at,
        f.assigned_reviewer_id,
        f.excluded_reviewer_ids,
        c.name as category_name,
        c.icon as category_icon,
        r.name as assigned_reviewer_name,
        r.avatar_url as assigned_reviewer_avatar,
        (SELECT COUNT(*) FROM conversation_messages cm WHERE cm.feedback_id = f.id AND cm.sender_type = 'sender') as sender_message_count,
        (SELECT COUNT(*) FROM conversation_messages cm WHERE cm.feedback_id = f.id AND cm.sender_type = 'reviewer') as reviewer_message_count,
        (SELECT cm.created_at FROM conversation_messages cm WHERE cm.feedback_id = f.id ORDER BY cm.created_at DESC LIMIT 1) as last_activity_at
      FROM feedback f
      LEFT JOIN categories c ON f.category_id = c.id
      LEFT JOIN reviewers r ON f.assigned_reviewer_id = r.id
      WHERE f.is_deleted = false
    `;

    const params: any[] = [];

    // Privacy & Sensitivity filter:
    // 1. If reviewer is general_reviewer, they cannot see sensitive feedback
    if (reviewer.role === 'general_reviewer') {
      baseQuery += ` AND f.is_sensitive = false`;
    }

    // 2. Excluded reviewers must NOT see items routed away from them
    baseQuery += ` AND NOT (f.excluded_reviewer_ids::jsonb @> to_jsonb($${params.length + 1}::text))`;
    params.push(reviewer.id);

    // Tab filters
    if (tab === 'unread') {
      baseQuery += ` AND f.status = 'New'`;
    } else if (tab === 'assigned') {
      baseQuery += ` AND f.assigned_reviewer_id = $${params.length + 1}`;
      params.push(reviewer.id);
    } else if (tab === 'resolved') {
      baseQuery += ` AND f.status IN ('Resolved', 'Closed')`;
    }

    // Category filter
    if (category && category !== 'all') {
      baseQuery += ` AND f.category_id = $${params.length + 1}`;
      params.push(category);
    }

    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      baseQuery += ` AND (LOWER(f.subject) LIKE $${params.length + 1} OR LOWER(f.message) LIKE $${params.length + 1} OR LOWER(f.public_id) LIKE $${params.length + 1})`;
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    // Sorting
    if (sort === 'oldest') {
      baseQuery += ` ORDER BY f.created_at ASC`;
    } else {
      baseQuery += ` ORDER BY f.created_at DESC`;
    }

    const result = await query(baseQuery, params);

    // Compute stats respecting reviewer visibility
    const statsQuery = `
      SELECT
        COUNT(*) as total_count,
        COUNT(CASE WHEN f.status = 'New' THEN 1 END) as unread_count,
        COUNT(CASE WHEN f.status = 'In Review' THEN 1 END) as awaiting_response_count,
        COUNT(CASE WHEN f.created_at < NOW() - INTERVAL '3 days' AND f.status NOT IN ('Resolved', 'Closed') THEN 1 END) as overdue_count,
        COUNT(CASE WHEN f.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week_count
      FROM feedback f
      WHERE f.is_deleted = false
      ${reviewer.role === 'general_reviewer' ? 'AND f.is_sensitive = false' : ''}
      AND NOT (f.excluded_reviewer_ids::jsonb @> to_jsonb($1::text))
    `;
    const statsRes = await query(statsQuery, [reviewer.id]);
    const stats = statsRes.rows[0];

    res.json({
      feedback: result.rows.map(row => ({
        ...row,
        // Calculate preview
        snippet: row.message ? (row.message.length > 90 ? row.message.slice(0, 90) + '...' : row.message) : '',
        is_overdue: new Date(row.created_at).getTime() < Date.now() - 3 * 24 * 60 * 60 * 1000 && !['Resolved', 'Closed'].includes(row.status)
      })),
      stats: {
        total: parseInt(stats.total_count || '0', 10),
        unread: parseInt(stats.unread_count || '0', 10),
        awaiting_response: parseInt(stats.awaiting_response_count || '0', 10),
        overdue: parseInt(stats.overdue_count || '0', 10),
        new_this_week: parseInt(stats.new_this_week_count || '0', 10)
      }
    });
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    res.status(500).json({ error: 'Failed to fetch feedback items' });
  }
});

// Reviewer Feedback Detail (Page 6)
router.get('/feedback/:publicId', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    const { publicId } = req.params;

    if (reviewer.role === 'action_owner') {
      return res.status(403).json({ error: 'Unauthorized to view feedback details.' });
    }

    const fbRes = await query(`
      SELECT
        f.*,
        c.name as category_name,
        c.icon as category_icon,
        r.name as assigned_reviewer_name,
        r.title as assigned_reviewer_title,
        r.avatar_url as assigned_reviewer_avatar
      FROM feedback f
      LEFT JOIN categories c ON f.category_id = c.id
      LEFT JOIN reviewers r ON f.assigned_reviewer_id = r.id
      WHERE f.public_id = $1 AND f.is_deleted = false
    `, [publicId]);

    if (fbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    const fb = fbRes.rows[0];

    // Check sensitivity permissions
    if (fb.is_sensitive && reviewer.role === 'general_reviewer') {
      return res.status(403).json({ error: 'This item is a sensitive report restricted to designated sensitive reviewers.' });
    }

    // Check exclusion list
    const excluded: string[] = fb.excluded_reviewer_ids || [];
    if (excluded.includes(reviewer.id)) {
      return res.status(403).json({ error: 'You are excluded from viewing this report due to alternate routing.' });
    }

    // Fetch conversation messages
    const messagesRes = await query(`
      SELECT
        cm.id,
        cm.sender_type,
        cm.body,
        cm.created_at,
        r.name as reviewer_name,
        r.title as reviewer_title,
        r.avatar_url as reviewer_avatar
      FROM conversation_messages cm
      LEFT JOIN reviewers r ON cm.author_id = r.id
      WHERE cm.feedback_id = $1
      ORDER BY cm.created_at ASC
    `, [fb.id]);

    // Fetch internal notes
    const notesRes = await query(`
      SELECT
        n.id,
        n.note,
        n.created_at,
        r.name as author_name,
        r.title as author_title,
        r.avatar_url as author_avatar
      FROM internal_notes n
      JOIN reviewers r ON n.author_id = r.id
      WHERE n.feedback_id = $1
      ORDER BY n.created_at DESC
    `, [fb.id]);

    // Fetch audit timeline
    const auditRes = await query(`
      SELECT
        a.id,
        a.action_type,
        a.details_json,
        a.created_at,
        r.name as reviewer_name
      FROM reviewer_audit_events a
      LEFT JOIN reviewers r ON a.reviewer_id = r.id
      WHERE a.feedback_id = $1
      ORDER BY a.created_at DESC
    `, [fb.id]);

    res.json({
      feedback: fb,
      messages: messagesRes.rows,
      internal_notes: notesRes.rows,
      history: auditRes.rows
    });
  } catch (error) {
    console.error('Error fetching feedback detail:', error);
    res.status(500).json({ error: 'Failed to fetch feedback detail' });
  }
});

// Reply to anonymous sender (Disabled by system policy - Zero Response Policy)
router.post('/feedback/:publicId/reply', reviewerAuthMiddleware, async (_req: ReviewerRequest, res: Response) => {
  return res.status(403).json({ error: 'Direct responses to submitters are disabled by system policy.' });
});

// Add Internal Note (Page 6 - INTERNAL NOTE)
router.post('/feedback/:publicId/internal-note', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    const { publicId } = req.params;
    const { note } = req.body;

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return res.status(400).json({ error: 'Internal note cannot be empty' });
    }

    const fbRes = await query(`SELECT id, is_sensitive, excluded_reviewer_ids FROM feedback WHERE public_id = $1`, [publicId]);
    if (fbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    const fb = fbRes.rows[0];

    const noteInsert = await query(`
      INSERT INTO internal_notes (feedback_id, author_id, note, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, note, created_at;
    `, [fb.id, reviewer.id, note.trim()]);

    await logReviewerAudit(reviewer.id, 'INTERNAL_NOTE_ADDED', fb.id, {
      note_id: noteInsert.rows[0].id
    });

    res.json({
      success: true,
      note: {
        ...noteInsert.rows[0],
        author_name: reviewer.name,
        author_title: reviewer.title,
        author_avatar: reviewer.avatar_url
      }
    });
  } catch (error) {
    console.error('Error adding internal note:', error);
    res.status(500).json({ error: 'Failed to add internal note' });
  }
});

// Update Status (New -> Acknowledged -> In Review -> Action Planned -> Resolved / Closed)
router.post('/feedback/:publicId/status', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    const { publicId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['New', 'Acknowledged', 'In Review', 'Action Planned', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const fbRes = await query(`SELECT id, status FROM feedback WHERE public_id = $1`, [publicId]);
    if (fbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    const fb = fbRes.rows[0];

    await query(`
      UPDATE feedback
      SET status = $1, closure_reason = $2, updated_at = NOW()
      WHERE id = $3
    `, [status, reason?.trim() || null, fb.id]);

    await logReviewerAudit(reviewer.id, 'STATUS_CHANGE', fb.id, {
      from: fb.status,
      to: status,
      reason: reason?.trim() || null
    });

    res.json({ success: true, status });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Assign Reviewer
router.post('/feedback/:publicId/assign', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    const { publicId } = req.params;
    const { reviewer_id } = req.body;

    const fbRes = await query(`SELECT id, is_sensitive FROM feedback WHERE public_id = $1`, [publicId]);
    if (fbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    const fb = fbRes.rows[0];

    const targetRevRes = await query(`SELECT id, name, role FROM reviewers WHERE id = $1 AND is_active = true`, [reviewer_id]);
    if (targetRevRes.rows.length === 0) {
      return res.status(400).json({ error: 'Target reviewer not found' });
    }

    await query(`UPDATE feedback SET assigned_reviewer_id = $1, updated_at = NOW() WHERE id = $2`, [reviewer_id, fb.id]);
    await query(`INSERT INTO reviewer_assignments (feedback_id, reviewer_id, assigned_by_id, assigned_at) VALUES ($1, $2, $3, NOW())`, [fb.id, reviewer_id, reviewer.id]);

    await logReviewerAudit(reviewer.id, 'ASSIGNMENT', fb.id, {
      assigned_to: reviewer_id
    });

    res.json({ success: true, assigned_to: targetRevRes.rows[0].name });
  } catch (error) {
    console.error('Error assigning reviewer:', error);
    res.status(500).json({ error: 'Failed to assign reviewer' });
  }
});

// Route to Alternate Reviewer (Sensitive Conflict Handling)
router.post('/feedback/:publicId/route-alternate', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    const { publicId } = req.params;
    const { alternate_reviewer_id, exclude_reviewer_id } = req.body;

    const fbRes = await query(`SELECT id, excluded_reviewer_ids FROM feedback WHERE public_id = $1`, [publicId]);
    if (fbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    const fb = fbRes.rows[0];

    const currentExcluded: string[] = fb.excluded_reviewer_ids || [];
    if (exclude_reviewer_id && !currentExcluded.includes(exclude_reviewer_id)) {
      currentExcluded.push(exclude_reviewer_id);
    }

    await query(`
      UPDATE feedback
      SET assigned_reviewer_id = $1,
          excluded_reviewer_ids = $2,
          updated_at = NOW()
      WHERE id = $3
    `, [alternate_reviewer_id, JSON.stringify(currentExcluded), fb.id]);

    await logReviewerAudit(reviewer.id, 'ROUTE_ALTERNATE', fb.id, {
      routed_to: alternate_reviewer_id,
      excluded: exclude_reviewer_id
    });

    res.json({ success: true, message: 'Routed to alternate reviewer' });
  } catch (error) {
    console.error('Error routing to alternate reviewer:', error);
    res.status(500).json({ error: 'Failed to route feedback' });
  }
});

// Create Redacted Action (assigned to action owner David Chen)
router.post('/feedback/:publicId/create-action', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    const { publicId } = req.params;
    const { action_title, redacted_description, action_owner_id, target_date } = req.body;

    if (!action_title || !redacted_description) {
      return res.status(400).json({ error: 'Action title and redacted description are required' });
    }

    const fbRes = await query(`SELECT id FROM feedback WHERE public_id = $1`, [publicId]);
    if (fbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    const fb = fbRes.rows[0];

    const actionRes = await query(`
      INSERT INTO improvement_actions (feedback_id, action_title, redacted_description, action_owner_id, status, target_date, created_at)
      VALUES ($1, $2, $3, $4, 'In Progress', $5, NOW())
      RETURNING *;
    `, [fb.id, action_title.trim(), redacted_description.trim(), action_owner_id || 'rev-david', target_date || null]);

    // Move feedback status to 'Action Planned'
    await query(`UPDATE feedback SET status = 'Action Planned', updated_at = NOW() WHERE id = $1`, [fb.id]);

    await logReviewerAudit(reviewer.id, 'REDACTED_ACTION_CREATED', fb.id, {
      action_id: actionRes.rows[0].id
    });

    res.json({ success: true, action: actionRes.rows[0] });
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ error: 'Failed to create action' });
  }
});

// Publish Public Update to "You Said, We Did"
router.post('/feedback/:publicId/publish-update', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    const { publicId } = req.params;
    const { staff_perspective, our_response, status = 'IN PROGRESS' } = req.body;

    if (!staff_perspective || !our_response) {
      return res.status(400).json({ error: 'Staff perspective quote and our response are required' });
    }

    const fbRes = await query(`SELECT id, share_in_updates_consent FROM feedback WHERE public_id = $1`, [publicId]);
    if (fbRes.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    const fb = fbRes.rows[0];

    const pubRes = await query(`
      INSERT INTO published_updates (feedback_id, status, staff_perspective, our_response, approved_by_id, published_at, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, NOW())
      RETURNING *;
    `, [fb.id, status, staff_perspective.trim(), our_response.trim(), reviewer.id]);

    await logReviewerAudit(reviewer.id, 'UPDATE_PUBLISHED', fb.id, {
      published_id: pubRes.rows[0].id
    });

    res.json({ success: true, published_update: pubRes.rows[0] });
  } catch (error) {
    console.error('Error publishing update:', error);
    res.status(500).json({ error: 'Failed to publish update' });
  }
});

// Action Owner Workspace: Redacted Actions Only (No Sender ID / No original message)
router.get('/actions', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const reviewer = req.reviewer!;
    // Only action owner or authorized reviewers can view
    const result = await query(`
      SELECT
        ia.id,
        ia.action_title,
        ia.redacted_description,
        ia.status,
        ia.target_date,
        ia.created_at,
        r.name as action_owner_name
      FROM improvement_actions ia
      LEFT JOIN reviewers r ON ia.action_owner_id = r.id
      ${reviewer.role === 'action_owner' ? 'WHERE ia.action_owner_id = $1' : ''}
      ORDER BY ia.created_at DESC
    `, reviewer.role === 'action_owner' ? [reviewer.id] : []);

    res.json({ actions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

// Update Action Status
router.post('/actions/:id/status', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query(`UPDATE improvement_actions SET status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update action' });
  }
});

// Leadership Metrics with Small Count Suppression (< 5 threshold)
router.get('/metrics', reviewerAuthMiddleware, async (req: ReviewerRequest, res: Response) => {
  try {
    const thresholdRes = await query(`SELECT min_reporting_threshold FROM retention_settings WHERE id = 1`);
    const minThreshold = thresholdRes.rows[0]?.min_reporting_threshold || 5;

    // Categories aggregated count
    const catQuery = `
      SELECT c.name as category_name, COUNT(f.id) as count
      FROM categories c
      LEFT JOIN feedback f ON c.id = f.category_id AND f.is_deleted = false
      GROUP BY c.name
      ORDER BY count DESC
    `;
    const catRes = await query(catQuery);

    const categoryBreakdown = catRes.rows.map(row => {
      const cnt = parseInt(row.count, 10);
      return {
        category: row.category_name,
        // Suppress counts below minimum threshold to prevent deanonymization in small teams
        count: cnt >= minThreshold ? cnt : `< ${minThreshold} (Suppressed for Privacy)`,
        is_suppressed: cnt < minThreshold
      };
    });

    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM feedback
      WHERE is_deleted = false
      GROUP BY status
    `;
    const statusRes = await query(statusQuery);

    const statusBreakdown = statusRes.rows.map(row => {
      const cnt = parseInt(row.count, 10);
      return {
        status: row.status,
        count: cnt >= minThreshold ? cnt : `< ${minThreshold} (Suppressed for Privacy)`,
        is_suppressed: cnt < minThreshold
      };
    });

    res.json({
      min_threshold: minThreshold,
      category_breakdown: categoryBreakdown,
      status_breakdown: statusBreakdown,
      explanation: `To safeguard anonymous contributors in small teams, specific category and period aggregates below ${minThreshold} responses are suppressed.`
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to calculate metrics' });
  }
});

export default router;
