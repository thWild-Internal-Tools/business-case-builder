import { query } from '../lib/db';

export type RevenueTiming = {
  id: string;
  revenue_item_id: string;
  start_date: string | null; // ISO date
  end_date: string | null;   // ISO date
  recurrence_interval_months: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listRevenueTiming(revenueItemId?: string): Promise<RevenueTiming[]> {
  if (revenueItemId) {
    const { rows } = await query<RevenueTiming>(
      `SELECT id, revenue_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at
         FROM revenue_timing
        WHERE revenue_item_id = $1
        ORDER BY created_at DESC`,
      [revenueItemId]
    );
    return rows;
  }
  const { rows } = await query<RevenueTiming>(
    `SELECT id, revenue_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at
       FROM revenue_timing
      ORDER BY created_at DESC`
  );
  return rows;
}

export async function getRevenueTiming(id: string): Promise<RevenueTiming | null> {
  const { rows } = await query<RevenueTiming>(
    `SELECT id, revenue_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at
       FROM revenue_timing
      WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createRevenueTiming(input: {
  revenue_item_id: string;
  start_date?: string | null;
  end_date?: string | null;
  recurrence_interval_months?: number | null;
  notes?: string | null;
}): Promise<RevenueTiming> {
  const { revenue_item_id, start_date = null, end_date = null, recurrence_interval_months = null, notes = null } = input;
  const { rows } = await query<RevenueTiming>(
    `INSERT INTO revenue_timing (revenue_item_id, start_date, end_date, recurrence_interval_months, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, revenue_item_id, start_date::text, end_date::text, recurrence_interval_months, notes, created_at, updated_at`,
    [revenue_item_id, start_date, end_date, recurrence_interval_months, notes]
  );
  return rows[0];
}

export async function updateRevenueTiming(
  id: string,
  input: Partial<{ start_date: string | null; end_date: string | null; recurrence_interval_months: number | null; notes: string | null }>
): Promise<RevenueTiming | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }
  if (fields.length === 0) return await getRevenueTiming(id);
  values.push(id);
  await query(`UPDATE revenue_timing SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}` as string, values);
  return await getRevenueTiming(id);
}

export async function deleteRevenueTiming(id: string): Promise<boolean> {
  const { rows } = await query<{ count: string }>(
    `WITH del AS (DELETE FROM revenue_timing WHERE id = $1 RETURNING 1)
     SELECT COUNT(*)::text AS count FROM del`,
    [id]
  );
  return Number(rows[0]?.count ?? '0') > 0;
}

