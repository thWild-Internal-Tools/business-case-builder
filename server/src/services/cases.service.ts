import { query } from '../lib/db';
import { mem, newId, now } from '../lib/memory-store';

export type CaseStatus = 'Active' | 'Planning' | 'Review';

export type BusinessCase = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  category?: string | null;
  time_basis?: 'Monthly' | 'Quarterly' | null;
  duration_value?: number | null;
  duration_unit?: 'months' | 'quarters' | null;
  currency_code?: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  tags?: string[];
};

const USE_DB = !!process.env.DATABASE_URL;

export async function listCases(): Promise<BusinessCase[]> {
  if (USE_DB) {
    const { rows } = await query<BusinessCase>(
      `SELECT c.id, c.client_id, c.title, c.description, c.status,
              c.category, c.time_basis, c.duration_value, c.duration_unit, c.currency_code,
              c.created_at, c.updated_at,
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
      `SELECT c.id, c.client_id, c.title, c.description, c.status,
              c.category, c.time_basis, c.duration_value, c.duration_unit, c.currency_code,
              c.created_at, c.updated_at,
              cl.name AS client_name
         FROM cases c
         JOIN clients cl ON cl.id = c.client_id
        WHERE c.id = $1`,
      [id]
    );
    const base = rows[0] ?? null;
    if (!base) return null;
    const tagsRes = await query<{ name: string }>(
      `SELECT t.name FROM case_tags ct JOIN tags t ON t.id = ct.tag_id WHERE ct.case_id = $1 ORDER BY t.name`,
      [id]
    );
    return { ...base, tags: tagsRes.rows.map((r) => r.name) };
  }
  const one = (mem.cases as BusinessCase[]).find((c) => c.id === id) || null;
  if (!one) return null;
  const client = (mem.clients as any[]).find((cl) => cl.id === one.client_id);
  const tags = (mem.case_tags as any[])
    .filter((ct) => ct.case_id === id)
    .map((ct) => (mem.tags as any[]).find((t) => t.id === ct.tag_id)?.name)
    .filter(Boolean);
  return { ...one, client_name: client?.name, tags } as BusinessCase;
}

export type CreateCaseInput = {
  client_id: string;
  title: string;
  description?: string | null;
  status?: CaseStatus;
  category?: string | null;
  time_basis?: 'Monthly' | 'Quarterly' | null;
  duration_value?: number | null;
  duration_unit?: 'months' | 'quarters' | null;
  currency_code?: string | null;
  tags?: string[];
};

export async function createCase(input: CreateCaseInput): Promise<BusinessCase> {
  const {
    client_id,
    title,
    description = null,
    status = 'Planning',
    category = null,
    time_basis = null,
    duration_value = null,
    duration_unit = null,
    currency_code = null,
    tags = []
  } = input;
  if (USE_DB) {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO cases (client_id, title, description, status, category, time_basis, duration_value, duration_unit, currency_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [client_id, title, description, status, category, time_basis, duration_value, duration_unit, currency_code]
    );
    const row = rows[0];
    // Upsert tags and link
    for (const raw of tags) {
      const name = (raw || '').trim();
      if (!name) continue;
      const tagRes = await query<{ id: string }>(
        `INSERT INTO tags(name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [name]
      );
      const tagId = tagRes.rows[0].id;
      await query(
        `INSERT INTO case_tags(case_id, tag_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [row.id, tagId]
      );
    }
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
    category,
    time_basis,
    duration_value: duration_value ?? null,
    duration_unit: duration_unit ?? null,
    currency_code,
    created_at: now(),
    updated_at: now()
  };
  (mem.cases as BusinessCase[]).unshift(row);
  // Upsert tags
  const tagIds: string[] = [];
  for (const raw of tags) {
    const name = (raw || '').trim();
    if (!name) continue;
    let t = (mem.tags as any[]).find((tg) => tg.name === name);
    if (!t) {
      t = { id: newId(), name, created_at: now(), updated_at: now() };
      (mem.tags as any[]).push(t);
    }
    tagIds.push(t.id);
  }
  for (const tagId of tagIds) {
    (mem.case_tags as any[]).push({ case_id: row.id, tag_id: tagId, created_at: now() });
  }
  return { ...row, client_name: client.name, tags: tags.filter((t) => !!t && t.trim()) } as BusinessCase;
}

export type UpdateCaseInput = Partial<
  Pick<
    CreateCaseInput,
    'client_id' | 'title' | 'description' | 'status' | 'category' | 'time_basis' | 'duration_value' | 'duration_unit' | 'currency_code' | 'tags'
  >
>;

export async function updateCase(id: string, input: UpdateCaseInput): Promise<BusinessCase | null> {
  if (USE_DB) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    const simpleFields = { ...input } as any;
    const tags = (simpleFields.tags as string[] | undefined) ?? undefined;
    delete simpleFields.tags;
    for (const [key, value] of Object.entries(simpleFields)) {
      if (value === undefined) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    if (fields.length === 0) {
      // still may need to update tags
    } else {
      values.push(id);
      await query(
        `UPDATE cases SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}`,
        values
      );
    }
    if (tags) {
      await query(`DELETE FROM case_tags WHERE case_id = $1`, [id]);
      for (const raw of tags) {
        const name = (raw || '').trim();
        if (!name) continue;
        const tagRes = await query<{ id: string }>(
          `INSERT INTO tags(name) VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [name]
        );
        const tagId = tagRes.rows[0].id;
        await query(`INSERT INTO case_tags(case_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, tagId]);
      }
    }
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
    category: input.category === undefined ? current.category : input.category ?? null,
    time_basis: input.time_basis === undefined ? current.time_basis : input.time_basis ?? null,
    duration_value: input.duration_value === undefined ? current.duration_value : input.duration_value ?? null,
    duration_unit: input.duration_unit === undefined ? current.duration_unit : input.duration_unit ?? null,
    currency_code: input.currency_code === undefined ? current.currency_code : input.currency_code ?? null,
    updated_at: now()
  };
  list[idx] = updated;
  if (input.tags) {
    // reset tags for this case
    (mem.case_tags as any[]) = (mem.case_tags as any[]).filter((ct) => ct.case_id !== id);
    const tagIds: string[] = [];
    for (const raw of input.tags) {
      const name = (raw || '').trim();
      if (!name) continue;
      let t = (mem.tags as any[]).find((tg) => tg.name === name);
      if (!t) {
        t = { id: newId(), name, created_at: now(), updated_at: now() };
        (mem.tags as any[]).push(t);
      }
      tagIds.push(t.id);
    }
    for (const tagId of tagIds) {
      (mem.case_tags as any[]).push({ case_id: id, tag_id: tagId, created_at: now() });
    }
  }
  const client = (mem.clients as any[]).find((cl) => cl.id === updated.client_id);
  const tags = (mem.case_tags as any[])
    .filter((ct) => ct.case_id === id)
    .map((ct) => (mem.tags as any[]).find((t) => t.id === ct.tag_id)?.name)
    .filter(Boolean);
  return { ...updated, client_name: client?.name, tags } as BusinessCase;
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
  mem.case_tags = (mem.case_tags as any[]).filter((ct) => ct.case_id !== id);
  return (mem.cases as BusinessCase[]).length < before;
}
