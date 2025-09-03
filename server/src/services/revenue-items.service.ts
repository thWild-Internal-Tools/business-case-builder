import { query } from '../lib/db';
import { mem, newId, now } from '../lib/memory-store';

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

const USE_DB = !!process.env.DATABASE_URL;

export async function listRevenueItems(caseId?: string): Promise<RevenueItem[]> {
  if (USE_DB) {
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
  let list = mem.revenue_items as RevenueItem[];
  if (caseId) list = list.filter((i) => i.case_id === caseId);
  return list.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getRevenueItem(id: string): Promise<RevenueItem | null> {
  if (USE_DB) {
    const { rows } = await query<RevenueItem>(
      `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
         FROM revenue_items
        WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }
  return (mem.revenue_items as RevenueItem[]).find((i) => i.id === id) ?? null;
}

export async function createRevenueItem(input: {
  case_id: string;
  name: string;
  category?: string | null;
  amount: number | string;
  notes?: string | null;
}): Promise<RevenueItem> {
  const { case_id, name, amount, category = null, notes = null } = input;
  if (USE_DB) {
    const { rows } = await query<RevenueItem>(
      `INSERT INTO revenue_items (case_id, name, category, amount, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, case_id, name, category, amount::text as amount, notes, created_at, updated_at`,
      [case_id, name, category, amount, notes]
    );
    return rows[0];
  }
  const row: RevenueItem = {
    id: newId(),
    case_id,
    name,
    category,
    amount: String(amount),
    notes,
    created_at: now(),
    updated_at: now()
  };
  (mem.revenue_items as RevenueItem[]).unshift(row);
  return row;
}

export async function updateRevenueItem(
  id: string,
  input: Partial<{ case_id: string; name: string; category: string | null; amount: number | string; notes: string | null }>
): Promise<RevenueItem | null> {
  if (USE_DB) {
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
  const list = mem.revenue_items as RevenueItem[];
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return null;
  const cur = list[i];
  const updated: RevenueItem = {
    ...cur,
    case_id: input.case_id ?? cur.case_id,
    name: input.name ?? cur.name,
    category: input.category === undefined ? cur.category : input.category,
    amount: input.amount === undefined ? cur.amount : String(input.amount),
    notes: input.notes === undefined ? cur.notes : input.notes,
    updated_at: now()
  };
  list[i] = updated;
  return updated;
}

export async function deleteRevenueItem(id: string): Promise<boolean> {
  if (USE_DB) {
    const { rows } = await query<{ count: string }>(
      `WITH del AS (DELETE FROM revenue_items WHERE id = $1 RETURNING 1)
       SELECT COUNT(*)::text AS count FROM del`,
      [id]
    );
    return Number(rows[0]?.count ?? '0') > 0;
  }
  const before = (mem.revenue_items as RevenueItem[]).length;
  mem.revenue_items = (mem.revenue_items as RevenueItem[]).filter((i) => i.id !== id);
  return (mem.revenue_items as RevenueItem[]).length < before;
}
