import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  // Neon recommends SSL; leave enabled by default when URL contains sslmode
  // ssl: { rejectUnauthorized: false },
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>{
  return pool.query(text, params);
}

