import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { pool } from './lib/db';
import casesRouter from './routes/cases.routes';
import clientsRouter from './routes/clients.routes';
import costItemsRouter from './routes/cost-items.routes';
import revenueItemsRouter from './routes/revenue-items.routes';
import costTimingRouter from './routes/cost-timing.routes';
import revenueTimingRouter from './routes/revenue-timing.routes';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// Enable CORS and handle preflight for all API routes
app.use(cors());
app.options('*', cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    // Simple DB connectivity check (optional if DATABASE_URL not set)
    if (process.env.DATABASE_URL) {
      const r = await pool.query('select 1 as ok');
      res.json({ ok: true, db: r.rows[0].ok === 1 });
    } else {
      res.json({ ok: true, db: false });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

app.use('/api/cases', casesRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/cost-items', costItemsRouter);
app.use('/api/revenue-items', revenueItemsRouter);
app.use('/api/cost-timing', costTimingRouter);
app.use('/api/revenue-timing', revenueTimingRouter);

// Serve React dashboard from client/dist at root
const clientDistPath = path.resolve(__dirname, '../../client/dist');

app.use(express.static(clientDistPath));

// SPA fallback: send index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
