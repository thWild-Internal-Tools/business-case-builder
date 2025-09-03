import { query } from '../lib/db';
import { mem, newId, now } from '../lib/memory-store';

export type CaseStatus = 'Active' | 'Planning' | 'Review';

export type BusinessCase = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
  client_name?: string;
};

const USE_DB = !!process.env.DATABASE_URL;

export async function listCases(): Promise<BusinessCase[]> {
  if (USE_DB) {
    const { rows } = await query<BusinessCase>(
      `SELECT c.id, c.client_id, c.title, c.description, c.status, c.created_at, c.updated_at,
              cl.name AS client_name
         FROM cases c
         JOIN clients cl ON cl.id = c.client_id
        ORDER BY c.created_at DESC`
    );
    return rows;
  }
  const clients = mem.clients as { id: string; name: string }[];
  const rows = (mem.cases as BusinessCase[])
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((c) => ({ ...c, client_name: clients.find((cl) => cl.id === c.client_id)?.name }));
  return rows;
}

export async function getCase(id: string): Promise<BusinessCase | null> {
  if (USE_DB) {
    const { rows } = await query<BusinessCase>(
      `SELECT c.id, c.client_id, c.title, c.description, c.status, c.created_at, c.updated_at,
              cl.name AS client_name
         FROM cases c
         JOIN clients cl ON cl.id = c.client_id
        WHERE c.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }
  const one = (mem.cases as BusinessCase[]).find((c) => c.id === id) || null;
  if (!one) return null;
  const client = (mem.clients as any[]).find((cl) => cl.id === one.client_id);
  return { ...one, client_name: client?.name };
}

export type CreateCaseInput = {
  client_id: string;
  title: string;
  description?: string | null;
  status?: CaseStatus;
};

export async function createCase(input: CreateCaseInput): Promise<BusinessCase> {
  const { client_id, title, description = null, status = 'Planning' } = input;
  if (USE_DB) {
    const { rows } = await query<BusinessCase>(
      `INSERT INTO cases (client_id, title, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, client_id, title, description, status, created_at, updated_at`,
      [client_id, title, description, status]
    );
    const row = rows[0];
    const one = await getCase(row.id);
    if (!one) throw new Error('Failed to fetch created case');
    return one;
  }
  const client = (mem.clients as any[]).find((cl) => cl.id === client_id);
  if (!client) throw new Error('invalid client_id');
  const row: BusinessCase = {
    id: newId(),
    client_id,
    title,
    description,
    status,
    created_at: now(),
    updated_at: now()
  };
  (mem.cases as BusinessCase[]).unshift(row);
  return { ...row, client_name: client.name };
}

export type UpdateCaseInput = Partial<Pick<CreateCaseInput, 'client_id' | 'title' | 'description' | 'status'>>;

export async function updateCase(id: string, input: UpdateCaseInput): Promise<BusinessCase | null> {
  if (USE_DB) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    if (fields.length === 0) {
      return await getCase(id); // nothing to update
    }
    values.push(id);
    await query(
      `UPDATE cases SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}`,
      values
    );
    return await getCase(id);
  }
  const list = mem.cases as BusinessCase[];
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const current = list[idx];
  const updated: BusinessCase = {
    ...current,
    client_id: input.client_id ?? current.client_id,
    title: input.title ?? current.title,
    description: input.description === undefined ? current.description : input.description,
    status: (input.status as CaseStatus) ?? current.status,
    updated_at: now()
  };
  list[idx] = updated;
  const client = (mem.clients as any[]).find((cl) => cl.id === updated.client_id);
  return { ...updated, client_name: client?.name };
}

export async function deleteCase(id: string): Promise<boolean> {
  if (USE_DB) {
    const { rows } = await query<{ count: string }>(
      `WITH del AS (DELETE FROM cases WHERE id = $1 RETURNING 1)
       SELECT COUNT(*)::text as count FROM del`,
      [id]
    );
    return Number(rows[0]?.count ?? '0') > 0;
  }
  const before = (mem.cases as BusinessCase[]).length;
  mem.cases = (mem.cases as BusinessCase[]).filter((c) => c.id !== id);
  // cascade delete items for this case
  mem.cost_items = (mem.cost_items as any[]).filter((i) => i.case_id !== id);
  mem.revenue_items = (mem.revenue_items as any[]).filter((i) => i.case_id !== id);
  return (mem.cases as BusinessCase[]).length < before;
}
