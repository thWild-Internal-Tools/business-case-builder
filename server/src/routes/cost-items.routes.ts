import { Router } from 'express';
import { listCostItems, getCostItem, createCostItem, updateCostItem, deleteCostItem } from '../services/cost-items.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { case_id } = req.query as { case_id?: string };
    const data = await listCostItems(case_id);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  const item = await getCostItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

router.post('/', async (req, res) => {
  try {
    const { case_id, name, category, amount, notes } = req.body || {};
    if (!case_id || !name || amount === undefined) {
      return res.status(400).json({ error: 'case_id, name, and amount are required' });
    }
    const created = await createCostItem({ case_id, name, category, amount, notes });
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { case_id, name, category, amount, notes } = req.body || {};
    const updated = await updateCostItem(req.params.id, { case_id, name, category, amount, notes });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteCostItem(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;

