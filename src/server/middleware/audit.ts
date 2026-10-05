import { query } from '../db.js';

export async function logReviewerAudit(
  reviewerId: string,
  actionType: string,
  feedbackId: number | null,
  details: Record<string, any> = {}
) {
  try {
    // Sanitization: Ensure NO message bodies, secrets, or raw text are stored in audit logs
    const sanitizedDetails = { ...details };
    delete sanitizedDetails.body;
    delete sanitizedDetails.message;
    delete sanitizedDetails.secret;
    delete sanitizedDetails.secret_hash;
    delete sanitizedDetails.note;

    await query(
      `INSERT INTO reviewer_audit_events (reviewer_id, action_type, feedback_id, details_json, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [reviewerId, actionType, feedbackId, JSON.stringify(sanitizedDetails)]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
