import { query } from '../lib/db';

export type RevenueItem = {
  id: string;
  case_id: string;
  name: string;
  category: string | null;
  amount: string; // numeric comes back as string
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listRevenueItems(caseId?: string): Promise<RevenueItem[]> {
  if (caseId) {
    const { rows } = await query<RevenueItem>(
      `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
         FROM revenue_items
        WHERE case_id = $1
        ORDER BY created_at DESC`,
      [caseId]
    );
    return rows;
  }
  const { rows } = await query<RevenueItem>(
    `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
       FROM revenue_items
      ORDER BY created_at DESC`
  );
  return rows;
}

export async function getRevenueItem(id: string): Promise<RevenueItem | null> {
  const { rows } = await query<RevenueItem>(
    `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
       FROM revenue_items
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createRevenueItem(input: {
  case_id: string;
  name: string;
  category?: string | null;
  amount: number | string;
  notes?: string | null;
}): Promise<RevenueItem> {
  const { case_id, name, amount, category = null, notes = null } = input;
  const { rows } = await query<RevenueItem>(
    `INSERT INTO revenue_items (case_id, name, category, amount, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, case_id, name, category, amount::text as amount, notes, created_at, updated_at`,
    [case_id, name, category, amount, notes]
  );
  return rows[0];
}

export async function updateRevenueItem(
  id: string,
  input: Partial<{ case_id: string; name: string; category: string | null; amount: number | string; notes: string | null }>
): Promise<RevenueItem | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }
  if (fields.length === 0) return await getRevenueItem(id);
  values.push(id);
  await query(`UPDATE revenue_items SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}` as string, values);
  return await getRevenueItem(id);
}

export async function deleteRevenueItem(id: string): Promise<boolean> {
  const { rows } = await query<{ count: string }>(
    `WITH del AS (DELETE FROM revenue_items WHERE id = $1 RETURNING 1)
     SELECT COUNT(*)::text AS count FROM del`,
    [id]
  );
  return Number(rows[0]?.count ?? '0') > 0;
}

