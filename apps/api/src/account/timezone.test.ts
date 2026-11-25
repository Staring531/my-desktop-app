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
const now = new Date('2026-06-10T14:30:00.000Z');

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

describe('PATCH /api/account/timezone', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-timezone-'));
  const port = 54346;
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
      throw new Error('timezone test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    const code = await register(baseUrl, mail);
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    cookie = await login(baseUrl);
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('keeps started instants, moves unstarted clocks, and leaves skips and choices', async () => {
    expect(await patch(baseUrl, '', { timezone: 'America/Los_Angeles' })).toEqual({
      status: 401,
      body: { result: 'logged_out' },
    });
    expect(
      (await save(baseUrl, cookie, series('Weekly', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    expect((await save(baseUrl, cookie, none('Solo', '2026-06-10', '11:00', '12:00'))).status).toBe(
      200,
    );
    expect(
      (await save(baseUrl, cookie, series('Days', 'daily', '2026-06-12', '15:00', '16:00'))).status,
    ).toBe(200);
    const daysId = await idByTitle(pool, 'Days');
    expect(
      await post(
        baseUrl,
        `/api/events/${daysId}/detach`,
        {
          title: 'Away',
          start: { date: '2026-06-12', time: '15:00' },
          end: { date: '2026-06-12', time: '16:00' },
          originalStart: '2026-06-12T19:00:00.000Z',
        },
        cookie,
      ),
    ).toMatchObject({ status: 200, body: { result: 'ok' } });
    expect(
      (await save(baseUrl, cookie, series('Spring', 'daily', '2027-03-01', '02:30', '03:30')))
        .status,
    ).toBe(200);
    expect(
      (await save(baseUrl, cookie, series('Open', 'daily', '2026-11-01', '01:30', '02:30'))).status,
    ).toBe(200);
    expect(
      (await save(baseUrl, cookie, series('Picked', 'weekly', '2026-11-01', '01:30', '02:30')))
        .status,
    ).toBe(200);
    const pickedId = await idByTitle(pool, 'Picked');
    expect(
      await post(
        baseUrl,
        `/api/events/${pickedId}/choices`,
        {
          date: '2026-11-01',
          instant: earlier,
        },
        cookie,
      ),
    ).toEqual({ status: 200, body: { result: 'ok' } });

    expect(await patch(baseUrl, cookie, { timezone: 'Not/AZone' })).toEqual({
      status: 400,
      body: { result: 'save_rejected' },
    });
    expect(await accountTimezone(pool)).toBe('America/New_York');
    expect(await freezeCount(pool)).toBe(0);
    expect(await instants(pool, 'Solo')).toEqual({
      start: '2026-06-10T15:00:00.000Z',
      end: '2026-06-10T16:00:00.000Z',
    });
    expect(await instants(pool, 'Away')).toEqual({
      start: '2026-06-12T19:00:00.000Z',
      end: '2026-06-12T20:00:00.000Z',
    });

    expect(await patch(baseUrl, cookie, { timezone: 'America/Los_Angeles' })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    expect(await accountTimezone(pool)).toBe('America/Los_Angeles');
    const weekly = named(await read(baseUrl, cookie, '2026-06-03', '2026-06-17'), 'Weekly');
    expect(weekly.map((row) => [row.date, row.start])).toEqual([
      ['2026-06-03', '2026-06-03T13:00:00.000Z'],
      ['2026-06-10', '2026-06-10T13:00:00.000Z'],
      ['2026-06-17', '2026-06-17T16:00:00.000Z'],
    ]);
    expect(await instants(pool, 'Solo')).toEqual({
      start: '2026-06-10T15:00:00.000Z',
      end: '2026-06-10T16:00:00.000Z',
    });
    expect(await instants(pool, 'Away')).toEqual({
      start: '2026-06-12T19:00:00.000Z',
      end: '2026-06-12T20:00:00.000Z',
    });
    const days = named(await read(baseUrl, cookie, '2026-06-12', '2026-06-13'), 'Days');
    expect(days.map((row) => row.date)).toEqual(['2026-06-13']);
    expect(days[0]?.start).toBe('2026-06-13T22:00:00.000Z');
    const spring = named(await read(baseUrl, cookie, '2027-03-14', '2027-03-14'), 'Spring');
    expect(spring[0]?.state).toBe('skipped');
    expect(spring[0]?.start).toBeUndefined();
    const open = named(await read(baseUrl, cookie, '2026-11-01', '2026-11-01'), 'Open');
    expect(open[0]).toMatchObject({
      state: 'choice_required',
      instants: [earlier, later],
    });
    expect(await chosenInstant(pool, await idByTitle(pool, 'Open'))).toBeNull();
    expect(await chosenInstant(pool, pickedId)).toBe(earlier);
    const picked = named(await read(baseUrl, cookie, '2026-11-01', '2026-11-01'), 'Picked');
    expect(picked[0]?.start).toBe(earlier);

    const overlap = await save(baseUrl, cookie, none('Overlap', '2026-10-31', '22:30', '23:00'));
    expect(overlap.status).toBe(200);
    expect(overlap.body.conflicts).toContainEqual({
      title: 'Picked',
      start: earlier,
      end: new Date(new Date(earlier).getTime() + 60 * 60_000).toISOString(),
    });
    expect(
      overlap.body.conflicts?.filter((row) => row.title === 'Open' && row.start === earlier) ?? [],
    ).toEqual([]);
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

async function register(baseUrl: string, mail: RecordingMail) {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/registrations', {
    username: 'owner',
    email: 'owner@example.com',
    password: 'secret-phrase',
    timezone: 'America/New_York',
  });
  expect(response).toEqual({ status: 200, body: { result: 'ok' } });
  return mail.messages[before]?.code ?? '';
}

async function login(baseUrl: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'owner@example.com', password: 'secret-phrase' }),
  });
  expect(response.status).toBe(200);
  return response.headers.getSetCookie()[0]?.split(';')[0] ?? '';
}

async function post(baseUrl: string, path: string, body: unknown, cookie?: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookie === undefined ? {} : { cookie }),
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function patch(baseUrl: string, cookie: string, body: unknown) {
  const response = await fetch(`${baseUrl}/api/account/timezone`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', ...(cookie === '' ? {} : { cookie }) },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function save(baseUrl: string, cookie: string, body: unknown) {
  const response = await fetch(`${baseUrl}/api/events`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    body: (await response.json()) as {
      result: string;
      conflicts?: Array<{ title: string; start: string; end: string }>;
    },
  };
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

async function accountTimezone(pool: Pool): Promise<string> {
  const result = await pool.query<{ timezone: string }>('SELECT timezone FROM accounts');
  return result.rows[0]?.timezone ?? '';
}

async function freezeCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM series_freezes',
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function instants(pool: Pool, title: string): Promise<{ start: string; end: string }> {
  const result = await pool.query<{ start_instant: Date; end_instant: Date }>(
    'SELECT start_instant, end_instant FROM events WHERE title = $1',
    [title],
  );
  return {
    start: result.rows[0]?.start_instant.toISOString() ?? '',
    end: result.rows[0]?.end_instant.toISOString() ?? '',
  };
}

async function chosenInstant(pool: Pool, seriesId: string): Promise<string | null> {
  const result = await pool.query<{ chosen_instant: Date | null }>(
    'SELECT chosen_instant FROM series_choices WHERE series_event_id = $1 AND civil_date = $2',
    [seriesId, '2026-11-01'],
  );
  return result.rows[0]?.chosen_instant?.toISOString() ?? null;
}
