import { query } from '../lib/db';
import { mem, newId, now } from '../lib/memory-store';

export type Client = {
  id: string;
  name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const USE_DB = !!process.env.DATABASE_URL;

export async function listClients(): Promise<Client[]> {
  if (USE_DB) {
    const { rows } = await query<Client>(
      `SELECT id, name, notes, created_at, updated_at
         FROM clients
        ORDER BY created_at DESC`
    );
    return rows;
  }
  const rows = (mem.clients as Client[]).slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return rows;
}

export async function getClient(id: string): Promise<Client | null> {
  if (USE_DB) {
    const { rows } = await query<Client>(
      `SELECT id, name, notes, created_at, updated_at
         FROM clients
        WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }
  return (mem.clients as Client[]).find((c) => c.id === id) ?? null;
}

export async function createClient(input: { name: string; notes?: string | null }): Promise<Client> {
  const { name, notes = null } = input;
  if (USE_DB) {
    const { rows } = await query<Client>(
      `INSERT INTO clients (name, notes)
       VALUES ($1, $2)
       RETURNING id, name, notes, created_at, updated_at`,
      [name, notes]
    );
    return rows[0];
  }
  const row: Client = { id: newId(), name, notes, created_at: now(), updated_at: now() };
  (mem.clients as Client[]).unshift(row);
  return row;
}

export async function updateClient(
  id: string,
  input: Partial<{ name: string; notes: string | null }>
): Promise<Client | null> {
  if (USE_DB) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    if (fields.length === 0) return await getClient(id);
    values.push(id);
    await query(`UPDATE clients SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}` as string, values);
    return await getClient(id);
  }
  const list = mem.clients as Client[];
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const current = list[idx];
  const updated: Client = {
    ...current,
    name: input.name ?? current.name,
    notes: input.notes === undefined ? current.notes : input.notes,
    updated_at: now()
  };
  list[idx] = updated;
  return updated;
}

export async function deleteClient(id: string): Promise<boolean> {
  if (USE_DB) {
    const { rows } = await query<{ count: string }>(
      `WITH del AS (DELETE FROM clients WHERE id = $1 RETURNING 1)
       SELECT COUNT(*)::text AS count FROM del`,
      [id]
    );
    return Number(rows[0]?.count ?? '0') > 0;
  }
  const before = (mem.clients as Client[]).length;
  // cascade delete related cases and their items
  const caseIds = (mem.cases as any[]).filter((c) => c.client_id === id).map((c) => c.id);
  mem.cases = (mem.cases as any[]).filter((c) => c.client_id !== id);
  mem.cost_items = (mem.cost_items as any[]).filter((i) => !caseIds.includes(i.case_id));
  mem.revenue_items = (mem.revenue_items as any[]).filter((i) => !caseIds.includes(i.case_id));
  mem.clients = (mem.clients as Client[]).filter((c) => c.id !== id);
  return (mem.clients as Client[]).length < before;
}
