import { query } from '../lib/db';

export type CostItem = {
  id: string;
  case_id: string;
  name: string;
  category: string | null;
  amount: string; // numeric comes back as string
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listCostItems(caseId?: string): Promise<CostItem[]> {
  if (caseId) {
    const { rows } = await query<CostItem>(
      `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
         FROM cost_items
        WHERE case_id = $1
        ORDER BY created_at DESC`,
      [caseId]
    );
    return rows;
  }
  const { rows } = await query<CostItem>(
    `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
       FROM cost_items
      ORDER BY created_at DESC`
  );
  return rows;
}

export async function getCostItem(id: string): Promise<CostItem | null> {
  const { rows } = await query<CostItem>(
    `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
       FROM cost_items
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createCostItem(input: {
  case_id: string;
  name: string;
  category?: string | null;
  amount: number | string;
  notes?: string | null;
}): Promise<CostItem> {
  const { case_id, name, amount, category = null, notes = null } = input;
  const { rows } = await query<CostItem>(
    `INSERT INTO cost_items (case_id, name, category, amount, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, case_id, name, category, amount::text as amount, notes, created_at, updated_at`,
    [case_id, name, category, amount, notes]
  );
  return rows[0];
}

export async function updateCostItem(
  id: string,
  input: Partial<{ case_id: string; name: string; category: string | null; amount: number | string; notes: string | null }>
): Promise<CostItem | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }
  if (fields.length === 0) return await getCostItem(id);
  values.push(id);
  await query(`UPDATE cost_items SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}` as string, values);
  return await getCostItem(id);
}

export async function deleteCostItem(id: string): Promise<boolean> {
  const { rows } = await query<{ count: string }>(
    `WITH del AS (DELETE FROM cost_items WHERE id = $1 RETURNING 1)
     SELECT COUNT(*)::text AS count FROM del`,
    [id]
  );
  return Number(rows[0]?.count ?? '0') > 0;
}

