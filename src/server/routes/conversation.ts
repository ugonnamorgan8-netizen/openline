import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import { hashConversationSecret } from '../crypto.js';

const router = Router();

// Access anonymous conversation using the 128-bit secret
router.post('/access', async (req: Request, res: Response) => {
  try {
    const { secret } = req.body;
    if (!secret || typeof secret !== 'string') {
      return res.status(400).json({ error: 'Conversation secret code is required' });
    }

    const secretHash = hashConversationSecret(secret);

    // Look up feedback associated with this secret hash
    const result = await query(`
      SELECT
        f.id,
        f.public_id,
        f.subject,
        f.status,
        f.is_sensitive,
        f.created_at,
        c.name as category_name
      FROM conversation_secrets cs
      JOIN feedback f ON cs.feedback_id = f.id
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE cs.secret_hash = $1 AND f.is_deleted = false
    `, [secretHash]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Conversation not found. Please double-check your secret code. Note that secrets cannot be recovered if lost.'
      });
    }

    const fb = result.rows[0];

    // Fetch conversation messages (internal notes are strictly omitted!)
    const messagesRes = await query(`
      SELECT
        cm.id,
        cm.sender_type,
        cm.body,
        cm.created_at,
        r.title as reviewer_title,
        r.name as reviewer_name
      FROM conversation_messages cm
      LEFT JOIN reviewers r ON cm.author_id = r.id
      WHERE cm.feedback_id = $1
      ORDER BY cm.created_at ASC
    `, [fb.id]);

    const messages = messagesRes.rows.map(m => ({
      id: m.id,
      sender_type: m.sender_type, // 'sender' | 'reviewer'
      body: m.body,
      created_at: m.created_at,
      reviewer_label: m.sender_type === 'reviewer'
        ? `${m.reviewer_name?.toUpperCase() || 'REVIEWER'}${m.reviewer_title ? ` (${m.reviewer_title.toUpperCase()})` : ''}`
        : null
    }));

    // Generate short-lived scoped session cookie or response data
    return res.json({
      success: true,
      conversation: {
        public_id: fb.public_id,
        subject: fb.subject || `${fb.category_name} Feedback`,
        category_name: fb.category_name,
        status: fb.status,
        created_at: fb.created_at,
        messages
      }
    });
  } catch (error) {
    console.error('Conversation access error:', error);
    res.status(500).json({ error: 'Failed to access conversation' });
  }
});

// Reply to anonymous conversation using the secret
router.post('/reply', async (req: Request, res: Response) => {
  try {
    const { secret, message } = req.body;
    if (!secret || typeof secret !== 'string') {
      return res.status(400).json({ error: 'Conversation secret code is required' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Reply message cannot be empty' });
    }

    const secretHash = hashConversationSecret(secret);

    const result = await query(`
      SELECT f.id, f.public_id, f.assigned_reviewer_id, f.status
      FROM conversation_secrets cs
      JOIN feedback f ON cs.feedback_id = f.id
      WHERE cs.secret_hash = $1 AND f.is_deleted = false
    `, [secretHash]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid secret code or conversation has expired' });
    }

    const fb = result.rows[0];

    // Insert reply as sender (author_id is strictly NULL)
    const msgInsert = await query(`
      INSERT INTO conversation_messages (feedback_id, sender_type, author_id, body, created_at)
      VALUES ($1, 'sender', NULL, $2, NOW())
      RETURNING id, sender_type, body, created_at;
    `, [fb.id, message.trim()]);

    // Update feedback updated_at and move back to Under review / In review if needed
    await query(`
      UPDATE feedback
      SET updated_at = NOW(),
          status = CASE WHEN status = 'Acknowledged' THEN 'In Review' ELSE status END
      WHERE id = $1
    `, [fb.id]);

    // Queue notification job for assigned reviewer (with NO message contents)
    if (fb.assigned_reviewer_id) {
      const reviewerRes = await query(`SELECT email FROM reviewers WHERE id = $1`, [fb.assigned_reviewer_id]);
      if (reviewerRes.rows.length > 0) {
        await query(`
          INSERT INTO notification_jobs (recipient_email, notification_type, feedback_public_id, status)
          VALUES ($1, 'FEEDBACK_REPLY_RECEIVED', $2, 'PENDING')
        `, [reviewerRes.rows[0].email, fb.public_id]);
      }
    }

    return res.json({
      success: true,
      message: msgInsert.rows[0]
    });
  } catch (error) {
    console.error('Conversation reply error:', error);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

export default router;
