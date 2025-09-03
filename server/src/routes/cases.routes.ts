import { Router } from 'express';
import { listCases } from '../services/cases.service';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ data: listCases() });
});

export default router;

