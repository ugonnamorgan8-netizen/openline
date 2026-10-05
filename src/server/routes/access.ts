import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { verifyPassword } from '../crypto.js';

const router = Router();

// Anti-abuse rate limiting on staff code verification attempts
const accessRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 verification attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification attempts. Please wait 15 minutes and try again.' }
});

// Verify staff access code
router.post('/verify', accessRateLimiter, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Staff access code is required' });
    }

    const settingsRes = await query(`SELECT staff_access_code_hash FROM retention_settings WHERE id = 1`);
    if (settingsRes.rows.length === 0) {
      return res.status(500).json({ error: 'System settings uninitialized' });
    }

    const storedHash = settingsRes.rows[0].staff_access_code_hash;
    const isValid = await verifyPassword(code.trim(), storedHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect staff access code. Please check with your team lead.' });
    }

    // Set lightweight access cookie or return success flag
    res.cookie('openline_staff_access', 'granted', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      message: 'Access code verified',
      notice: 'This is a lightweight access gate. It can be shared and does not prove employee identity or link submissions.'
    });
  } catch (error) {
    console.error('Access verification error:', error);
    res.status(500).json({ error: 'Failed to verify access code' });
  }
});

// Check current access status
router.get('/status', (req: Request, res: Response) => {
  const hasAccess = req.cookies?.openline_staff_access === 'granted';
  res.json({ verified: hasAccess });
});

export default router;
