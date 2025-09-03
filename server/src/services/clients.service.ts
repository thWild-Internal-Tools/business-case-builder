import { query } from '../lib/db';

export type Client = {
  id: string;
  name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listClients(): Promise<Client[]> {
  const { rows } = await query<Client>(
    `SELECT id, name, notes, created_at, updated_at
       FROM clients
      ORDER BY created_at DESC`
  );
  return rows;
}

export async function getClient(id: string): Promise<Client | null> {
  const { rows } = await query<Client>(
    `SELECT id, name, notes, created_at, updated_at
       FROM clients
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createClient(input: { name: string; notes?: string | null }): Promise<Client> {
  const { name, notes = null } = input;
  const { rows } = await query<Client>(
    `INSERT INTO clients (name, notes)
     VALUES ($1, $2)
     RETURNING id, name, notes, created_at, updated_at`,
    [name, notes]
  );
  return rows[0];
}

export async function updateClient(
  id: string,
  input: Partial<{ name: string; notes: string | null }>
): Promise<Client | null> {
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

export async function deleteClient(id: string): Promise<boolean> {
  const { rows } = await query<{ count: string }>(
    `WITH del AS (DELETE FROM clients WHERE id = $1 RETURNING 1)
     SELECT COUNT(*)::text AS count FROM del`,
    [id]
  );
  return Number(rows[0]?.count ?? '0') > 0;
}

