import 'reflect-metadata';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { Pool } from 'pg';
import { createApplication } from '../app.module';
import { applyMigrations, createPersonalTimePool, migrationsDirectory } from '../db/connection';
import type { MailPort, ProofMessage } from '../mail/protocol';

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

describe('occurrence expansion', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-expand-'));
  const port = 54341;
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
  let accountId = '';

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
    app = await NestFactory.create(createApplication({ pool, mail }), { logger: false });
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    if (address === null || typeof address === 'string') {
      throw new Error('expansion test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    const code = await register(baseUrl, mail);
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    cookie = await login(baseUrl);
    accountId = (await pool.query<{ id: string }>('SELECT id FROM accounts')).rows[0]?.id ?? '';
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('shows a weekly series on Wednesday only and a daily series on each later day', async () => {
    const before = await eventCount(pool);
    expect((await save(baseUrl, cookie, series('Weekly', 'weekly', '2026-01-07'))).body).toEqual({
      result: 'ok',
      conflicts: [],
      continuesAfterWindow: true,
    });
    const weekly = await read(baseUrl, cookie, '2026-01-07', '2026-01-21');
    expect(weekly.body.occurrences?.map((row) => row.date)).toEqual([
      '2026-01-07',
      '2026-01-14',
      '2026-01-21',
    ]);
    expect(weekly.body.occurrences?.map((row) => row.start)).toEqual([
      '2026-01-07T14:00:00.000Z',
      '2026-01-14T14:00:00.000Z',
      '2026-01-21T14:00:00.000Z',
    ]);
    expect(weekly.body.occurrences?.[0]).toMatchObject({
      state: 'scheduled',
      title: 'Weekly',
      start: '2026-01-07T14:00:00.000Z',
      end: '2026-01-07T15:00:00.000Z',
    });
    expect((await save(baseUrl, cookie, series('Daily', 'daily', '2026-06-01'))).status).toBe(200);
    const daily = await read(baseUrl, cookie, '2026-06-01', '2026-06-03');
    expect(named(daily.body.occurrences, 'Daily')).toEqual([
      scheduled('Daily', '2026-06-01', '2026-06-01T13:00:00.000Z', '2026-06-01T14:00:00.000Z'),
      scheduled('Daily', '2026-06-02', '2026-06-02T13:00:00.000Z', '2026-06-02T14:00:00.000Z'),
      scheduled('Daily', '2026-06-03', '2026-06-03T13:00:00.000Z', '2026-06-03T14:00:00.000Z'),
    ]);
    const past = await read(baseUrl, cookie, '2026-01-07', '2026-01-07');
    expect(past.body.occurrences?.[0]?.state).toBe('scheduled');
    expect(await eventCount(pool)).toBe(before + 2);
  });

  it('uses a freeze, hides an absence, and shows a skip and an unchosen start', async () => {
    const dailyId = await idByTitle(pool, 'Daily');
    await pool.query(
      `INSERT INTO series_freezes (series_event_id, original_start_instant, start_instant, end_instant)
       VALUES ($1, '2026-06-02T13:00:00.000Z', '2026-06-02T12:00:00.000Z', '2026-06-02T13:00:00.000Z')`,
      [dailyId],
    );
    await pool.query(
      `INSERT INTO series_absences (series_event_id, original_start_instant, civil_date)
       VALUES ($1, '2026-06-03T13:00:00.000Z', '2026-06-03')`,
      [dailyId],
    );
    expect((await save(baseUrl, cookie, series('March', 'daily', '2026-03-07'))).status).toBe(200);
    const marchId = await idByTitle(pool, 'March');
    await pool.query(
      `INSERT INTO series_skip_rules (series_event_id, timezone, local_start, local_end)
       VALUES ($1, 'America/New_York', '02:30', '03:30')`,
      [marchId],
    );
    await pool.query(
      `INSERT INTO series_choices (series_event_id, civil_date, earlier_instant, later_instant)
       VALUES ($1, '2026-11-01', '2026-11-01T05:30:00.000Z', '2026-11-01T06:30:00.000Z')`,
      [dailyId],
    );
    const june = await read(baseUrl, cookie, '2026-06-01', '2026-06-03');
    expect(named(june.body.occurrences, 'Daily')).toEqual([
      scheduled('Daily', '2026-06-01', '2026-06-01T13:00:00.000Z', '2026-06-01T14:00:00.000Z'),
      {
        ...scheduled('Daily', '2026-06-02', '2026-06-02T12:00:00.000Z', '2026-06-02T13:00:00.000Z'),
        originalStart: '2026-06-02T13:00:00.000Z',
      },
    ]);
    const march = await read(baseUrl, cookie, '2026-03-08', '2026-03-08');
    expect(named(march.body.occurrences, 'March')).toEqual([
      {
        id: marchId,
        state: 'skipped',
        visibility: 'private',
        title: 'March',
        location: '',
        description: '',
        displayName: 'owner',
        date: '2026-03-08',
      },
    ]);
    const choice = await read(baseUrl, cookie, '2026-11-01', '2026-11-01');
    const required = named(choice.body.occurrences, 'Daily');
    expect(required).toEqual([
      {
        id: dailyId,
        state: 'choice_required',
        visibility: 'private',
        title: 'Daily',
        location: '',
        description: '',
        displayName: 'owner',
        date: '2026-11-01',
        instants: ['2026-11-01T05:30:00.000Z', '2026-11-01T06:30:00.000Z'],
      },
    ]);
    expect(required[0]).not.toHaveProperty('start');
    expect(await eventCount(pool)).toBe(3);
  });

  it('lists an overlapping owned event beside the continuation flag', async () => {
    const focus = randomUUID();
    const calendarId = (
      await pool.query<{ id: string }>('SELECT id FROM calendars WHERE owner_account_id = $1', [
        accountId,
      ])
    ).rows[0]?.id;
    await pool.query(
      `INSERT INTO events (
         id, calendar_id, creator_account_id, repetition, title, location, description, visibility,
         start_instant, end_instant
       ) VALUES ($1, $2, $3, 'none', 'Focus', '', '', 'private',
         '2026-08-05T15:00:00.000Z', '2026-08-05T16:00:00.000Z')`,
      [focus, calendarId, accountId],
    );
    const saved = await save(baseUrl, cookie, {
      ...series('Standup', 'weekly', '2026-08-05'),
      start: { date: '2026-08-05', time: '11:00' },
      end: { date: '2026-08-05', time: '12:00' },
    });
    expect(saved.body).toEqual({
      result: 'ok',
      conflicts: [
        {
          title: 'Focus',
          start: '2026-08-05T15:00:00.000Z',
          end: '2026-08-05T16:00:00.000Z',
        },
      ],
      continuesAfterWindow: true,
    });
    expect(saved.body.conflicts?.[0]).not.toHaveProperty('continuesAfterWindow');
    expect(JSON.stringify(saved.body.conflicts)).not.toContain('Standup');
    expect(JSON.stringify(saved.body)).not.toContain('owner@example.com');
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

function series(title: string, repetition: string, date: string) {
  return {
    title,
    repetition,
    start: { date, time: '09:00' },
    end: { date, time: '10:00' },
  };
}

function named(
  occurrences: Array<{ title?: string }> | undefined,
  title: string,
): Array<{ title?: string }> {
  return occurrences?.filter((row) => row.title === title) ?? [];
}

function scheduled(title: string, date: string, start: string, end: string) {
  return {
    id: expect.any(String) as unknown as string,
    state: 'scheduled',
    visibility: 'private',
    title,
    location: '',
    description: '',
    displayName: 'owner',
    date,
    start,
    end,
    originalStart: start,
  };
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

async function post(baseUrl: string, path: string, body: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
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
      continuesAfterWindow?: boolean;
    },
  };
}

async function read(baseUrl: string, cookie: string, from: string, to: string) {
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}`, {
    headers: { cookie },
  });
  return {
    status: response.status,
    body: (await response.json()) as {
      occurrences?: Array<{
        id?: string;
        state?: string;
        title?: string;
        date?: string;
        start?: string;
        end?: string;
      }>;
    },
  };
}

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}

async function eventCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT count(*)::text AS count FROM events');
  return Number(result.rows[0]?.count ?? 0);
}
