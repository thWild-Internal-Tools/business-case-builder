import { Router } from 'express';
import { listCases, getCase, createCase, updateCase, deleteCase, CaseStatus } from '../services/cases.service';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await listCases();
  res.json({ data });
});

router.get('/:id', async (req, res) => {
  const item = await getCase(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

router.post('/', async (req, res) => {
  try {
    const { client_id, title, description, status, category, time_basis, duration_value, duration_unit, currency_code, tags } =
      req.body || {};
    if (!client_id || !title) {
      return res.status(400).json({ error: 'client_id and title are required' });
    }
    if (status && !['Active', 'Planning', 'Review'].includes(status as CaseStatus)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    const created = await createCase({
      client_id,
      title,
      description,
      status,
      category,
      time_basis,
      duration_value,
      duration_unit,
      currency_code,
      tags
    });
    res.status(201).json({ data: created });
  } catch (err) {
    const msg = (err as Error).message;
    // 23503 = foreign_key_violation, 22P02 = invalid_text_representation (e.g. bad uuid)
    res.status(400).json({ error: msg });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      client_id,
      title,
      description,
      status,
      category,
      time_basis,
      duration_value,
      duration_unit,
      currency_code,
      tags
    } = req.body || {};
    if (status && !['Active', 'Planning', 'Review'].includes(status as CaseStatus)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    const updated = await updateCase(req.params.id, {
      client_id,
      title,
      description,
      status,
      category,
      time_basis,
      duration_value,
      duration_unit,
      currency_code,
      tags
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  } catch (err) {
    const msg = (err as Error).message;
    res.status(400).json({ error: msg });
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteCase(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;
