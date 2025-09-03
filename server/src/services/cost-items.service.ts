import { query } from '../lib/db';
import { mem, newId, now } from '../lib/memory-store';

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

const USE_DB = !!process.env.DATABASE_URL;

export async function listCostItems(caseId?: string): Promise<CostItem[]> {
  if (USE_DB) {
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
  let list = mem.cost_items as CostItem[];
  if (caseId) list = list.filter((i) => i.case_id === caseId);
  return list.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getCostItem(id: string): Promise<CostItem | null> {
  if (USE_DB) {
    const { rows } = await query<CostItem>(
      `SELECT id, case_id, name, category, amount::text as amount, notes, created_at, updated_at
         FROM cost_items
        WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }
  return (mem.cost_items as CostItem[]).find((i) => i.id === id) ?? null;
}

export async function createCostItem(input: {
  case_id: string;
  name: string;
  category?: string | null;
  amount: number | string;
  notes?: string | null;
}): Promise<CostItem> {
  const { case_id, name, amount, category = null, notes = null } = input;
  if (USE_DB) {
    const { rows } = await query<CostItem>(
      `INSERT INTO cost_items (case_id, name, category, amount, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, case_id, name, category, amount::text as amount, notes, created_at, updated_at`,
      [case_id, name, category, amount, notes]
    );
    return rows[0];
  }
  const row: CostItem = {
    id: newId(),
    case_id,
    name,
    category,
    amount: String(amount),
    notes,
    created_at: now(),
    updated_at: now()
  };
  (mem.cost_items as CostItem[]).unshift(row);
  return row;
}

export async function updateCostItem(
  id: string,
  input: Partial<{ case_id: string; name: string; category: string | null; amount: number | string; notes: string | null }>
): Promise<CostItem | null> {
  if (USE_DB) {
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
  const list = mem.cost_items as CostItem[];
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) return null;
  const cur = list[i];
  const updated: CostItem = {
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

export async function deleteCostItem(id: string): Promise<boolean> {
  if (USE_DB) {
    const { rows } = await query<{ count: string }>(
      `WITH del AS (DELETE FROM cost_items WHERE id = $1 RETURNING 1)
       SELECT COUNT(*)::text AS count FROM del`,
      [id]
    );
    return Number(rows[0]?.count ?? '0') > 0;
  }
  const before = (mem.cost_items as CostItem[]).length;
  mem.cost_items = (mem.cost_items as CostItem[]).filter((i) => i.id !== id);
  return (mem.cost_items as CostItem[]).length < before;
}
