import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { generateConversationSecret, hashConversationSecret } from '../crypto.js';

const router = Router();

// Anti-abuse rate limiting specifically on feedback submissions (not on category listing)
const submissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 feedback submissions per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission rate limit reached. Please try again later.' }
});

// Cache recent submission hashes for 60 seconds to prevent double clicks / retry duplicates
const recentSubmissions = new Map<string, { public_id: string; secret: string; timestamp: number }>();

// Clean old submission deduplication entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of recentSubmissions.entries()) {
    if (now - val.timestamp > 60000) {
      recentSubmissions.delete(key);
    }
  }
}, 30000);

// Get available feedback categories with designated reviewer info
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categoriesResult = await query(
      `SELECT id, name, description, icon, is_sensitive, default_reviewer_ids, sort_order
       FROM categories
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    const reviewersResult = await query(
      `SELECT id, name, department, title, avatar_url
       FROM reviewers
       WHERE is_active = true`
    );

    const reviewersMap = new Map<string, any>();
    reviewersResult.rows.forEach(r => reviewersMap.set(r.id, r));

    const categories = categoriesResult.rows.map(cat => {
      const reviewerIds = cat.default_reviewer_ids || [];
      const assignedReviewers = reviewerIds
        .map((id: string) => reviewersMap.get(id))
        .filter(Boolean);

      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        is_sensitive: cat.is_sensitive,
        assigned_reviewers: assignedReviewers
      };
    });

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Submit anonymous feedback
router.post('/submit', submissionRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      category_id,
      subject,
      message,
      suggested_improvement,
      share_in_updates_consent,
      routing_choice, // e.g. 'rev-elena' or 'rev-marcus' if alternate reviewer requested
      idempotency_key
    } = req.body;

    if (!category_id || typeof category_id !== 'string') {
      return res.status(400).json({ error: 'Category selection is required' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check duplicate retry within short window
    const dedupeKey = idempotency_key || `${category_id}:${message.trim().slice(0, 80)}`;
    if (recentSubmissions.has(dedupeKey)) {
      const cached = recentSubmissions.get(dedupeKey)!;
      return res.json({
        success: true,
        public_id: cached.public_id,
        secret: cached.secret,
        is_retry: true
      });
    }

    // Verify category exists
    const catRes = await query(
      `SELECT id, name, is_sensitive, default_reviewer_ids FROM categories WHERE id = $1 AND is_active = true`,
      [category_id]
    );

    if (catRes.rows.length === 0) {
      return res.status(400).json({ error: 'Selected category does not exist' });
    }

    const category = catRes.rows[0];
    const isSensitive = category.is_sensitive;

    // Fetch retention settings
    const settingsRes = await query(`SELECT general_retention_days, sensitive_retention_days FROM retention_settings WHERE id = 1`);
    const settings = settingsRes.rows[0] || { general_retention_days: 180, sensitive_retention_days: 90 };
    const retentionDays = isSensitive ? settings.sensitive_retention_days : settings.general_retention_days;

    // Determine reviewer assignment
    const defaultReviewers: string[] = category.default_reviewer_ids || [];
    let assignedReviewerId = defaultReviewers[0] || 'rev-elena';
    const excludedReviewers: string[] = [];

    if (isSensitive && routing_choice && defaultReviewers.includes(routing_choice)) {
      assignedReviewerId = routing_choice;
      // Exclude the other designated sensitive reviewer to protect sender if there's a conflict
      for (const rId of defaultReviewers) {
        if (rId !== routing_choice) {
          excludedReviewers.push(rId);
        }
      }
    }

    // Generate random public ID (e.g. FB-4821)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const publicId = `FB-${randomNum}`;

    // Generate 128-bit conversation secret
    const secret = generateConversationSecret();
    const secretHash = hashConversationSecret(secret);

    // Insert into feedback table (NO user identifiers, IPs, sessions, or reviewer IDs stored as submitter)
    const feedbackInsert = await query(`
      INSERT INTO feedback (
        public_id,
        category_id,
        subject,
        message,
        suggested_improvement,
        share_in_updates_consent,
        status,
        assigned_reviewer_id,
        is_sensitive,
        routing_choice,
        excluded_reviewer_ids,
        retention_expires_at,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'New', $7, $8, $9, $10, NOW() + INTERVAL '${retentionDays} days', NOW(), NOW()
      ) RETURNING id;
    `, [
      publicId,
      category_id,
      subject?.trim() || null,
      message.trim(),
      suggested_improvement?.trim() || null,
      !!share_in_updates_consent,
      assignedReviewerId,
      isSensitive,
      routing_choice || null,
      JSON.stringify(excludedReviewers)
    ]);

    const feedbackId = feedbackInsert.rows[0].id;

    // Store only the hash of the secret
    await query(`
      INSERT INTO conversation_secrets (feedback_id, secret_hash)
      VALUES ($1, $2)
    `, [feedbackId, secretHash]);

    // Insert initial sender message
    await query(`
      INSERT INTO conversation_messages (feedback_id, sender_type, author_id, body, created_at)
      VALUES ($1, 'sender', NULL, $2, NOW())
    `, [feedbackId, message.trim()]);

    // Record assignment
    await query(`
      INSERT INTO reviewer_assignments (feedback_id, reviewer_id, is_active, assigned_at)
      VALUES ($1, $2, true, NOW())
    `, [feedbackId, assignedReviewerId]);

    // Queue notification job without message body or secret!
    const reviewerRes = await query(`SELECT email FROM reviewers WHERE id = $1`, [assignedReviewerId]);
    if (reviewerRes.rows.length > 0) {
      await query(`
        INSERT INTO notification_jobs (recipient_email, notification_type, feedback_public_id, status)
        VALUES ($1, 'NEW_FEEDBACK_ASSIGNED', $2, 'PENDING')
      `, [reviewerRes.rows[0].email, publicId]);
    }

    // Cache deduplication token
    recentSubmissions.set(dedupeKey, { public_id: publicId, secret, timestamp: Date.now() });

    return res.json({
      success: true,
      public_id: publicId,
      secret,
      category_name: category.name,
      retention_days: retentionDays
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to process feedback submission' });
  }
});

export default router;
