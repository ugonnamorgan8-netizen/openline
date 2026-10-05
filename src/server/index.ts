import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import accessRouter from './routes/access.js';
import feedbackRouter from './routes/feedback.js';
import conversationRouter from './routes/conversation.js';
import reviewerRouter from './routes/reviewer.js';
import updatesRouter from './routes/updates.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false // Allows inline styles/fonts for development UI
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Privacy enforcement: Never store private data in client caches
app.use('/api/conversation', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use('/api/reviewer', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});

// Mount API routes
app.use('/api/access', accessRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/conversation', conversationRouter);
app.use('/api/reviewer', reviewerRouter);
app.use('/api/updates', updatesRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'D’Creativs OpenLine',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend files in production
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>D'Creativs OpenLine</title></head>
          <body>
            <h2>OpenLine Server is running.</h2>
            <p>Vite development server or build output required.</p>
          </body>
        </html>
      `);
    }
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL && !process.argv.some(arg => arg.includes('test_suite'))) {
  app.listen(PORT, () => {
    console.log(`D’Creativs OpenLine server running on http://localhost:${PORT}`);
  });
}

export default app;
