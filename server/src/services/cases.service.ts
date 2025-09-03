import { query } from '../lib/db';

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

export async function listCases(): Promise<BusinessCase[]> {
  const { rows } = await query<BusinessCase>(
    `SELECT c.id, c.client_id, c.title, c.description, c.status, c.created_at, c.updated_at,
            cl.name AS client_name
       FROM cases c
       JOIN clients cl ON cl.id = c.client_id
      ORDER BY c.created_at DESC`
  );
  return rows;
}

export async function getCase(id: string): Promise<BusinessCase | null> {
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

export type CreateCaseInput = {
  client_id: string;
  title: string;
  description?: string | null;
  status?: CaseStatus;
};

export async function createCase(input: CreateCaseInput): Promise<BusinessCase> {
  const { client_id, title, description = null, status = 'Planning' } = input;
  const { rows } = await query<BusinessCase>(
    `INSERT INTO cases (client_id, title, description, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, client_id, title, description, status, created_at, updated_at`,
    [client_id, title, description, status]
  );
  const row = rows[0];
  // Attach client_name for convenience
  const one = await getCase(row.id);
  if (!one) throw new Error('Failed to fetch created case');
  return one;
}

export type UpdateCaseInput = Partial<Pick<CreateCaseInput, 'client_id' | 'title' | 'description' | 'status'>>;

export async function updateCase(id: string, input: UpdateCaseInput): Promise<BusinessCase | null> {
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

export async function deleteCase(id: string): Promise<boolean> {
  const { rows } = await query<{ count: string }>(
    `WITH del AS (DELETE FROM cases WHERE id = $1 RETURNING 1)
     SELECT COUNT(*)::text as count FROM del`,
    [id]
  );
  return Number(rows[0]?.count ?? '0') > 0;
}
