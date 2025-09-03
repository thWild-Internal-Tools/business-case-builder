import { Router } from 'express';
import { listCostTiming, getCostTiming, createCostTiming, updateCostTiming, deleteCostTiming } from '../services/cost-timing.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { cost_item_id } = req.query as { cost_item_id?: string };
    const data = await listCostTiming(cost_item_id);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  const item = await getCostTiming(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

router.post('/', async (req, res) => {
  try {
    const { cost_item_id, start_date, end_date, recurrence_interval_months, notes } = req.body || {};
    if (!cost_item_id) return res.status(400).json({ error: 'cost_item_id is required' });
    const created = await createCostTiming({ cost_item_id, start_date, end_date, recurrence_interval_months, notes });
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { start_date, end_date, recurrence_interval_months, notes } = req.body || {};
    const updated = await updateCostTiming(req.params.id, { start_date, end_date, recurrence_interval_months, notes });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteCostTiming(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;

