import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { applyMigrations, createPersonalTimePool, migrationsDirectory } from './connection';

const require = createRequire(__filename);

type EmbeddedPostgresServer = {
  initialise(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  createDatabase(name: string): Promise<void>;
};

type EmbeddedPostgresConstructor = new (options: {
  databaseDir: string;
  user: string;
  password: string;
  port: number;
  persistent: boolean;
}) => EmbeddedPostgresServer;

const embeddedPostgresModule = require('embedded-postgres') as
  EmbeddedPostgresConstructor | { default: EmbeddedPostgresConstructor };

const EmbeddedPostgres =
  'default' in embeddedPostgresModule ? embeddedPostgresModule.default : embeddedPostgresModule;

describe('personal-time schema', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-pg-'));
  const port = 54329;
  const database = 'personal_time';
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false,
  });
  const pool = createPersonalTimePool(
    `postgresql://postgres:postgres@127.0.0.1:${port}/${database}`,
  );

  beforeAll(async () => {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase(database);
    const client = await pool.connect();
    try {
      await applyMigrations(client, migrationsDirectory());
    } finally {
      client.release();
    }
  }, 120_000);

  afterAll(async () => {
    await pool.end();
    await postgres.stop();
  });

  it('creates the ten first-delivery tables and no later-delivery table', async () => {
    const tables = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
    );
    expect(tables.rows.map((row) => row.table_name)).toEqual([
      'accounts',
      'calendars',
      'events',
      'mail_gate',
      'proofs',
      'retired_usernames',
      'schema_migrations',
      'series_absences',
      'series_choices',
      'series_freezes',
      'series_skip_rules',
      'sessions',
    ]);
    const columns = await pool.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name IN ('sessions', 'proofs')`,
    );
    const names = columns.rows.map((row) => row.column_name);
    expect(names).not.toContain('expires_at');
    expect(names).not.toContain('lifetime');
  });

  it('rejects a second username, a second email, and a second calendar', async () => {
    const account = await pool.query<{ id: string }>(
      `INSERT INTO accounts (id, username, email, password_hash, timezone)
       VALUES (gen_random_uuid(), 'sam', 'sam@example.com', 'hash', 'America/New_York')
       RETURNING id`,
    );
    const accountId = account.rows[0]?.id;
    expect(accountId).toBeTruthy();
    await expect(
      pool.query(
        `INSERT INTO accounts (id, username, email, password_hash, timezone)
         VALUES (gen_random_uuid(), 'sam', 'other@example.com', 'hash', 'America/New_York')`,
      ),
    ).rejects.toMatchObject({ code: '23505' });
    await expect(
      pool.query(
        `INSERT INTO accounts (id, username, email, password_hash, timezone)
         VALUES (gen_random_uuid(), 'other', 'sam@example.com', 'hash', 'America/New_York')`,
      ),
    ).rejects.toMatchObject({ code: '23505' });
    await pool.query(
      `INSERT INTO calendars (id, owner_account_id, kind)
       VALUES (gen_random_uuid(), $1, 'personal')`,
      [accountId],
    );
    await expect(
      pool.query(
        `INSERT INTO calendars (id, owner_account_id, kind)
         VALUES (gen_random_uuid(), $1, 'personal')`,
        [accountId],
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('keeps a detached event and its series id after the series row is deleted', async () => {
    const owner = await pool.query<{ id: string }>(
      `INSERT INTO accounts (id, username, email, password_hash, timezone)
       VALUES (gen_random_uuid(), 'detached-owner', 'detached@example.com', 'hash', 'UTC')
       RETURNING id`,
    );
    const accountId = owner.rows[0]?.id;
    const calendar = await pool.query<{ id: string }>(
      `INSERT INTO calendars (id, owner_account_id, kind)
       VALUES (gen_random_uuid(), $1, 'personal')
       RETURNING id`,
      [accountId],
    );
    const calendarId = calendar.rows[0]?.id;
    const series = await pool.query<{ id: string }>(
      `INSERT INTO events (
         id, calendar_id, creator_account_id, repetition, title, location, description,
         visibility, local_start, local_end, anchor_date
       ) VALUES (
         gen_random_uuid(), $1, $2, 'daily', 'Series', '', '',
         'private', '09:00', '10:00', '2026-01-01'
       ) RETURNING id`,
      [calendarId, accountId],
    );
    const seriesId = series.rows[0]?.id;
    const detached = await pool.query<{ id: string }>(
      `INSERT INTO events (
         id, calendar_id, creator_account_id, repetition, title, location, description,
         visibility, start_instant, end_instant, detached_from_event_id, original_start_instant
       ) VALUES (
         gen_random_uuid(), $1, $2, 'none', 'Detached', '', '',
         'private', '2026-01-02T09:00:00Z', '2026-01-02T10:00:00Z', $3, '2026-01-02T09:00:00Z'
       ) RETURNING id`,
      [calendarId, accountId, seriesId],
    );
    const detachedId = detached.rows[0]?.id;
    await pool.query('DELETE FROM series_freezes WHERE series_event_id = $1', [seriesId]);
    await pool.query('DELETE FROM series_absences WHERE series_event_id = $1', [seriesId]);
    await pool.query('DELETE FROM series_skip_rules WHERE series_event_id = $1', [seriesId]);
    await pool.query('DELETE FROM series_choices WHERE series_event_id = $1', [seriesId]);
    await pool.query('DELETE FROM events WHERE id = $1', [seriesId]);
    const remaining = await pool.query<{ detached_from_event_id: string }>(
      'SELECT detached_from_event_id FROM events WHERE id = $1',
      [detachedId],
    );
    expect(remaining.rows[0]?.detached_from_event_id).toBe(seriesId);
    expect(
      readFileSync(join(migrationsDirectory(), '001_personal_time.sql'), 'utf8'),
    ).not.toContain('team-record.json');
  });
});
