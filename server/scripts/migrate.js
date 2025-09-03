#!/usr/bin/env node
// Simple migration runner for .sql files in server/migrations
// Applies files in name order and records them in __migrations table.

require('dotenv/config');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function run() {
  const dir = path.join(__dirname, '..', 'migrations');
  if (!fs.existsSync(dir)) {
    console.error('No migrations directory found:', dir);
    process.exit(1);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const appliedRes = await client.query('SELECT id, checksum FROM __migrations');
    const applied = new Map(appliedRes.rows.map((r) => [r.id, r.checksum]));

    for (const file of files) {
      const full = path.join(dir, file);
      const sql = fs.readFileSync(full);
      const sum = sha256(sql);
      const prev = applied.get(file);
      if (prev && prev !== sum) {
        throw new Error(`Checksum mismatch for ${file}. Migration changed after being applied.`);
      }
      if (prev) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }
      console.log(`Applying ${file}...`);
      await client.query('BEGIN');
      try {
        await client.query(sql.toString());
        await client.query('INSERT INTO __migrations (id, checksum) VALUES ($1, $2)', [file, sum]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log('Migrations complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});

