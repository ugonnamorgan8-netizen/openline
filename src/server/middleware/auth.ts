import { Request, Response, NextFunction } from 'express';
import { query } from '../db.js';

export interface AuthenticatedReviewer {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'general_reviewer' | 'sensitive_reviewer' | 'action_owner' | 'leadership_viewer';
  department: string;
  title: string;
  avatar_url: string;
}

export interface ReviewerRequest extends Request {
  reviewer?: AuthenticatedReviewer;
}

export async function reviewerAuthMiddleware(req: ReviewerRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.openline_reviewer_id;
    const reviewerId = authHeader ? authHeader.replace('Bearer ', '') : cookieToken;

    if (!reviewerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await query(
      `SELECT id, name, email, role, department, title, avatar_url, is_active FROM reviewers WHERE id = $1 AND is_active = true`,
      [reviewerId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or inactive reviewer session' });
    }

    req.reviewer = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

export function requireRoles(...roles: string[]) {
  return (req: ReviewerRequest, res: Response, next: NextFunction) => {
    if (!req.reviewer) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.reviewer.role)) {
      return res.status(403).json({ error: `Access denied. Requires role: ${roles.join(', ')}` });
    }
    next();
  };
}
