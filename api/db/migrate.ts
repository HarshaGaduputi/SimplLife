import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { config } from '../config/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('[SimplLife DB] FATAL: DATABASE_URL is required in production.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();
  
  try {
    // 1. Create migration tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Detect applied migrations
    const res = await client.query('SELECT name FROM migrations ORDER BY id ASC;');
    const applied = new Set(res.rows.map(row => row.name));

    // 3. Read and apply missing migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (!applied.has(file)) {
        console.log(`[SimplLife DB] Applying migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`[SimplLife DB] Migration applied: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[SimplLife DB] Migration failed: ${file}`, err);
          throw err;
        }
      }
    }
    
    console.log('[SimplLife DB] All migrations applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

// If run directly
if (process.argv[1] === __filename) {
  runMigrations().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
