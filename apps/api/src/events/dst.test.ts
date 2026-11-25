import 'reflect-metadata';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { Pool } from 'pg';
import { createApplication } from '../app.module';
import { applyMigrations, createPersonalTimePool, migrationsDirectory } from '../db/connection';
import type { MailPort, ProofMessage } from '../mail/protocol';
import { resolveLocalClock } from '../time/civil-time';

const require = createRequire(__filename);
const now = new Date('2026-02-01T15:00:00.000Z');

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

const doubled = resolveLocalClock('America/New_York', {
  year: 2026,
  month: 11,
  day: 1,
  hour: 1,
  minute: 30,
});
const earlier = doubled.outcome === 'twice' ? new Date(doubled.earlier).toISOString() : '';
const later = doubled.outcome === 'twice' ? new Date(doubled.later).toISOString() : '';

describe('missing and doubled local times', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-dst-'));
  const port = 54345;
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false,
  });
  const mail = new RecordingMail();
  let pool: Pool;
  let app: INestApplication;
  let baseUrl = '';
  let cookie = '';

  beforeAll(async () => {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase('personal_time');
    pool = createPersonalTimePool(`postgresql://postgres:postgres@127.0.0.1:${port}/personal_time`);
    const client = await pool.connect();
    try {
      await applyMigrations(client, migrationsDirectory());
    } finally {
      client.release();
    }
    app = await NestFactory.create(createApplication({ pool, mail, now: () => now }), {
      logger: false,
    });
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    if (address === null || typeof address === 'string') {
      throw new Error('dst test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    const code = await register(baseUrl, mail, 'owner', 'owner@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    cookie = await login(baseUrl, 'owner@example.com');
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('writes nothing for a missing or unchosen doubled entered time', async () => {
    const before = await eventCount(pool);
    const missing = await save(baseUrl, cookie, none('Missing', '2026-03-08', '02:30', '03:30'));
    expect(missing).toEqual({ status: 400, body: { result: 'save_rejected' } });
    const unchosen = await save(baseUrl, cookie, none('Doubled', '2026-11-01', '01:30', '02:30'));
    expect(unchosen).toEqual({ status: 400, body: { result: 'save_rejected' } });
    expect(JSON.stringify(unchosen.body)).toBe('{"result":"save_rejected"}');
    const wrong = await save(baseUrl, cookie, {
      ...none('Wrong', '2026-11-01', '01:30', '02:30'),
      chosenStart: '2026-11-01T12:00:00.000Z',
    });
    expect(wrong).toEqual({ status: 400, body: { result: 'save_rejected' } });
    expect(await eventCount(pool)).toBe(before);
  });

  it('stores the chosen earlier instant for an entered doubled start', async () => {
    const saved = await save(baseUrl, cookie, {
      ...none('Chosen', '2026-11-01', '01:30', '02:30'),
      chosenStart: earlier,
    });
    expect(saved.status).toBe(200);
    const stored = await pool.query<{ start_instant: Date }>(
      'SELECT start_instant FROM events WHERE title = $1',
      ['Chosen'],
    );
    expect(stored.rows[0]?.start_instant.toISOString()).toBe(earlier);
  });

  it('keeps a generated missing start skipped after a clock and timezone change', async () => {
    const before = await eventCount(pool);
    expect(
      (await save(baseUrl, cookie, series('Spring', 'daily', '2026-03-01', '02:30', '03:30')))
        .status,
    ).toBe(200);
    expect(await eventCount(pool)).toBe(before + 1);
    const seriesId = await idByTitle(pool, 'Spring');
    const skipped = named(await read(baseUrl, cookie, '2026-03-08', '2026-03-08'), 'Spring');
    expect(skipped).toEqual([
      expect.objectContaining({ state: 'skipped', date: '2026-03-08', title: 'Spring' }),
    ]);
    expect(skipped[0]?.start).toBeUndefined();
    expect(JSON.stringify(skipped)).not.toContain('cancelled');
    expect(
      (
        await save(
          baseUrl,
          cookie,
          series('Spring', 'daily', '2026-03-01', '09:00', '10:00'),
          seriesId,
        )
      ).status,
    ).toBe(200);
    const moved = named(await read(baseUrl, cookie, '2026-03-08', '2026-03-09'), 'Spring');
    expect(moved.find((row) => row.date === '2026-03-08')).toMatchObject({ state: 'skipped' });
    expect(moved.find((row) => row.date === '2026-03-09')?.start).toBe('2026-03-09T13:00:00.000Z');
    await pool.query(
      `UPDATE accounts SET timezone = 'UTC' WHERE id = (SELECT id FROM accounts LIMIT 1)`,
    );
    const shifted = named(await read(baseUrl, cookie, '2026-03-08', '2026-03-08'), 'Spring');
    expect(shifted[0]?.state).toBe('skipped');
    await pool.query(`UPDATE accounts SET timezone = 'America/New_York' WHERE timezone = 'UTC'`);
    const rules = await pool.query(
      `SELECT timezone, local_start::text FROM series_skip_rules WHERE series_event_id = $1`,
      [seriesId],
    );
    expect(rules.rows).toEqual([
      expect.objectContaining({ timezone: 'America/New_York', local_start: '02:30:00' }),
    ]);
  });

  it('skips a generated missing end and a gap across the missing hour', async () => {
    expect(
      (await save(baseUrl, cookie, series('EndGap', 'daily', '2026-03-01', '01:00', '02:30')))
        .status,
    ).toBe(200);
    expect(
      (await save(baseUrl, cookie, series('Across', 'daily', '2026-03-01', '01:30', '03:30')))
        .status,
    ).toBe(200);
    const endGap = named(await read(baseUrl, cookie, '2026-03-08', '2026-03-08'), 'EndGap');
    const across = named(await read(baseUrl, cookie, '2026-03-08', '2026-03-08'), 'Across');
    expect(endGap[0]?.state).toBe('skipped');
    expect(across[0]?.state).toBe('skipped');
    expect(await eventCount(pool, 'EndGap')).toBe(1);
    expect(await eventCount(pool, 'Across')).toBe(1);
  });

  it('offers an unchosen doubled start and stores one instant for the owner', async () => {
    expect(
      (await save(baseUrl, cookie, series('Fall', 'weekly', '2026-11-01', '01:30', '02:30')))
        .status,
    ).toBe(200);
    const seriesId = await idByTitle(pool, 'Fall');
    const offered = named(await read(baseUrl, cookie, '2026-11-01', '2026-11-01'), 'Fall');
    expect(offered[0]).toMatchObject({
      state: 'choice_required',
      date: '2026-11-01',
      instants: [earlier, later],
    });
    expect(offered[0]?.start).toBeUndefined();
    const overlap = await save(baseUrl, cookie, {
      ...none('Overlap', '2026-11-01', '01:30', '02:00'),
      chosenStart: earlier,
    });
    expect(overlap.status).toBe(200);
    expect(overlap.body.conflicts?.map((row) => row.title) ?? []).not.toContain('Fall');

    expect(await choose(baseUrl, '', seriesId, { date: '2026-11-01', instant: earlier })).toEqual({
      status: 401,
      body: { result: 'logged_out' },
    });
    const guestCode = await register(baseUrl, mail, 'guest', 'guest@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code: guestCode })).toMatchObject({
      status: 200,
    });
    const guest = await login(baseUrl, 'guest@example.com');
    expect(
      await choose(baseUrl, guest, seriesId, { date: '2026-11-01', instant: earlier }),
    ).toEqual({ status: 404, body: { result: 'not_found' } });
    expect(
      await choose(baseUrl, cookie, seriesId, {
        date: '2026-11-01',
        instant: '2026-11-01T12:00:00.000Z',
      }),
    ).toEqual({ status: 400, body: { result: 'save_rejected' } });
    expect(await chosenInstant(pool, seriesId)).toBeNull();

    expect(
      await choose(baseUrl, cookie, seriesId, { date: '2026-11-01', instant: earlier }),
    ).toEqual({ status: 200, body: { result: 'ok' } });
    expect(await chosenInstant(pool, seriesId)).toBe(earlier);
    const overlapId = await idByTitle(pool, 'Overlap');
    const compared = await save(
      baseUrl,
      cookie,
      { ...none('Overlap', '2026-11-01', '01:30', '02:00'), chosenStart: earlier },
      overlapId,
    );
    expect(compared.status).toBe(200);
    expect(compared.body.conflicts).toContainEqual({
      title: 'Fall',
      start: earlier,
      end: new Date(new Date(earlier).getTime() + 60 * 60_000).toISOString(),
    });
  });
});

class RecordingMail implements MailPort {
  messages: ProofMessage[] = [];

  canSend(): Promise<boolean> {
    return Promise.resolve(true);
  }

  sendProof(message: ProofMessage): Promise<'accepted'> {
    this.messages.push(message);
    return Promise.resolve('accepted');
  }
}

type Occurrence = {
  title?: string;
  date?: string;
  start?: string;
  state?: string;
  instants?: string[];
};

function named(body: { occurrences?: Occurrence[] }, title: string) {
  return body.occurrences?.filter((row) => row.title === title) ?? [];
}

function series(title: string, repetition: string, date: string, start: string, end: string) {
  return {
    title,
    repetition,
    start: { date, time: start },
    end: { date, time: end },
  };
}

function none(title: string, date: string, start: string, end: string) {
  return { title, repetition: 'none', start: { date, time: start }, end: { date, time: end } };
}

async function register(baseUrl: string, mail: RecordingMail, username: string, email: string) {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/registrations', {
    username,
    email,
    password: 'secret-phrase',
    timezone: 'America/New_York',
  });
  expect(response).toEqual({ status: 200, body: { result: 'ok' } });
  return mail.messages[before]?.code ?? '';
}

async function login(baseUrl: string, email: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret-phrase' }),
  });
  expect(response.status).toBe(200);
  return response.headers.getSetCookie()[0]?.split(';')[0] ?? '';
}

async function post(baseUrl: string, path: string, body: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function save(baseUrl: string, cookie: string, body: unknown, id?: string) {
  const response = await fetch(
    `${baseUrl}${id === undefined ? '/api/events' : `/api/events/${id}`}`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    },
  );
  return {
    status: response.status,
    body: (await response.json()) as {
      result: string;
      conflicts?: Array<{ title: string; start: string; end: string }>;
    },
  };
}

async function choose(
  baseUrl: string,
  cookie: string,
  id: string,
  body: { date: string; instant: string },
) {
  const response = await fetch(`${baseUrl}/api/events/${id}/choices`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie === '' ? {} : { cookie }) },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function read(baseUrl: string, cookie: string, from: string, to: string) {
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}`, {
    headers: { cookie },
  });
  return (await response.json()) as { occurrences?: Occurrence[] };
}

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}

async function eventCount(pool: Pool, title?: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    title === undefined
      ? 'SELECT count(*)::text AS count FROM events'
      : 'SELECT count(*)::text AS count FROM events WHERE title = $1',
    title === undefined ? [] : [title],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function chosenInstant(pool: Pool, seriesId: string): Promise<string | null> {
  const result = await pool.query<{ chosen_instant: Date | null }>(
    'SELECT chosen_instant FROM series_choices WHERE series_event_id = $1 AND civil_date = $2',
    [seriesId, '2026-11-01'],
  );
  return result.rows[0]?.chosen_instant?.toISOString() ?? null;
}
