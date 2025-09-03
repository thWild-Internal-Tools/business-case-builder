import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './lib/db';
import casesRouter from './routes/cases.routes';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
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

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

