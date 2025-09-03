import { Router } from 'express';
import { listRevenueItems, getRevenueItem, createRevenueItem, updateRevenueItem, deleteRevenueItem } from '../services/revenue-items.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { case_id } = req.query as { case_id?: string };
    const data = await listRevenueItems(case_id);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  const item = await getRevenueItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

router.post('/', async (req, res) => {
  try {
    const { case_id, name, category, amount, notes } = req.body || {};
    if (!case_id || !name || amount === undefined) {
      return res.status(400).json({ error: 'case_id, name, and amount are required' });
    }
    const created = await createRevenueItem({ case_id, name, category, amount, notes });
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { case_id, name, category, amount, notes } = req.body || {};
    const updated = await updateRevenueItem(req.params.id, { case_id, name, category, amount, notes });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteRevenueItem(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;

