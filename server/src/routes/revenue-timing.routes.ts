import { Router } from 'express';
import { listRevenueTiming, getRevenueTiming, createRevenueTiming, updateRevenueTiming, deleteRevenueTiming } from '../services/revenue-timing.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { revenue_item_id } = req.query as { revenue_item_id?: string };
    const data = await listRevenueTiming(revenue_item_id);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  const item = await getRevenueTiming(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

router.post('/', async (req, res) => {
  try {
    const { revenue_item_id, start_date, end_date, recurrence_interval_months, notes } = req.body || {};
    if (!revenue_item_id) return res.status(400).json({ error: 'revenue_item_id is required' });
    const created = await createRevenueTiming({ revenue_item_id, start_date, end_date, recurrence_interval_months, notes });
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { start_date, end_date, recurrence_interval_months, notes } = req.body || {};
    const updated = await updateRevenueTiming(req.params.id, { start_date, end_date, recurrence_interval_months, notes });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteRevenueTiming(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;

