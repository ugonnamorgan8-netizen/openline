import { Router, Request, Response } from 'express';
import { query } from '../db.js';

const router = Router();

// Publicly visible approved updates (Page 7 - You Said, We Did)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT
        id,
        status,
        staff_perspective,
        our_response,
        TO_CHAR(published_at, 'Mon DD, YYYY') as published_date,
        published_at
      FROM published_updates
      ORDER BY published_at DESC, id DESC
    `);

    res.json({ updates: result.rows });
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ error: 'Failed to fetch public updates' });
  }
});

export default router;
