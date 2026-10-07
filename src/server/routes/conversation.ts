import { Router, Request, Response } from 'express';

const router = Router();

// Anonymous conversation response feature disabled per Zero Response Policy
router.post('/access', (_req: Request, res: Response) => {
  return res.status(404).json({
    error: 'Direct response channels are disabled by system policy to ensure 100% submitter anonymity.'
  });
});

router.post('/reply', (_req: Request, res: Response) => {
  return res.status(403).json({
    error: 'Two-way replies are disabled by system policy.'
  });
});

export default router;
