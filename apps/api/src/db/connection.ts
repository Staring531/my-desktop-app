import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool, type PoolClient } from 'pg';

export function createPersonalTimePool(databaseUrl: string): Pool {
  return new Pool({ connectionString: databaseUrl });
}

export function migrationsDirectory(): string {
  return join(__dirname, '../../migrations');
}

export async function applyMigrations(client: PoolClient, directory: string): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL
    )
  `);
  const files = readdirSync(directory)
    .filter((name) => name.endsWith('.sql'))
    .sort();
  for (const name of files) {
    const existing = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
    if ((existing.rowCount ?? 0) > 0) {
      continue;
    }
    await client.query(readFileSync(join(directory, name), 'utf8'));
    await client.query('INSERT INTO schema_migrations (name, applied_at) VALUES ($1, now())', [
      name,
    ]);
  }
}
