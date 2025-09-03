import { query } from '../lib/db';

export type CostTiming = {
  id: string;
  cost_item_id: string;
  start_date: string | null; // ISO date
  end_date: string | null;   // ISO date
  recurrence_interval_months: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listCostTiming(costItemId?: string): Promise<CostTiming[]> {
  if (costItemId) {
    const { rows } = await query<CostTiming>(
      `SELECT id, cost_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at
         FROM cost_timing
        WHERE cost_item_id = $1
        ORDER BY created_at DESC`,
      [costItemId]
    );
    return rows;
  }
  const { rows } = await query<CostTiming>(
    `SELECT id, cost_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at
       FROM cost_timing
      ORDER BY created_at DESC`
  );
  return rows;
}

export async function getCostTiming(id: string): Promise<CostTiming | null> {
  const { rows } = await query<CostTiming>(
    `SELECT id, cost_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at
       FROM cost_timing
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createCostTiming(input: {
  cost_item_id: string;
  start_date?: string | null;
  end_date?: string | null;
  recurrence_interval_months?: number | null;
  notes?: string | null;
}): Promise<CostTiming> {
  const { cost_item_id, start_date = null, end_date = null, recurrence_interval_months = null, notes = null } = input;
  const { rows } = await query<CostTiming>(
    `INSERT INTO cost_timing (cost_item_id, start_date, end_date, recurrence_interval_months, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, cost_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at`,
    [cost_item_id, start_date, end_date, recurrence_interval_months, notes]
  );
  return rows[0];
}

export async function updateCostTiming(
  id: string,
  input: Partial<{ start_date: string | null; end_date: string | null; recurrence_interval_months: number | null; notes: string | null }>
): Promise<CostTiming | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }
  if (fields.length === 0) return await getCostTiming(id);
  values.push(id);
  await query(`UPDATE cost_timing SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}` as string, values);
  return await getCostTiming(id);
}

export async function deleteCostTiming(id: string): Promise<boolean> {
  const { rows } = await query<{ count: string }>(
    `WITH del AS (DELETE FROM cost_timing WHERE id = $1 RETURNING 1)
     SELECT COUNT(*)::text AS count FROM del`,
    [id]
  );
  return Number(rows[0]?.count ?? '0') > 0;
}

