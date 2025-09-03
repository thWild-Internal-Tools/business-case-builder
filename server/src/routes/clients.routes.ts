import { Router } from 'express';
import { listClients, getClient, createClient, updateClient, deleteClient } from '../services/clients.service';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await listClients();
  res.json({ data });
});

router.get('/:id', async (req, res) => {
  const item = await getClient(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

router.post('/', async (req, res) => {
  try {
    const { name, notes } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const created = await createClient({ name, notes });
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, notes } = req.body || {};
    const updated = await updateClient(req.params.id, { name, notes });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteClient(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;

