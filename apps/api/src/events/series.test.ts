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

describe('series templates', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-series-'));
  const port = 54340;
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
    app = await NestFactory.create(createApplication({ pool, mail }), { logger: false });
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    if (address === null || typeof address === 'string') {
      throw new Error('series test server has no port');
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

  it('stores a weekly Wednesday, a daily template, and a past series', async () => {
    const weekly = await save(baseUrl, cookie, seriesBody('Weekly', 'weekly', '2026-01-07'));
    expect(weekly).toEqual({
      status: 200,
      body: { result: 'ok', conflicts: [], continuesAfterWindow: true },
    });
    expect(await stored(pool, 'Weekly')).toEqual({
      repetition: 'weekly',
      anchor_date: '2026-01-07',
      local_start: '09:00:00',
      local_end: '10:00:00',
      weekday: 3,
      month_day: null,
      start_instant: null,
      end_instant: null,
    });
    expect(
      (await save(baseUrl, cookie, seriesBody('Daily', 'daily', '2026-06-02', '11:00', '12:00')))
        .body,
    ).toEqual({
      result: 'ok',
      conflicts: [],
      continuesAfterWindow: true,
    });
    expect(await stored(pool, 'Daily')).toMatchObject({
      repetition: 'daily',
      anchor_date: '2026-06-02',
      local_start: '11:00:00',
      local_end: '12:00:00',
      weekday: null,
      month_day: null,
    });
    const past = await save(
      baseUrl,
      cookie,
      seriesBody('Past', 'daily', '2020-01-01', '15:00', '16:00'),
    );
    expect(past.body.continuesAfterWindow).toBe(true);
    expect(await stored(pool, 'Past')).toMatchObject({
      repetition: 'daily',
      anchor_date: '2020-01-01',
    });
  });

  it('stores a monthly date that exists in every month', async () => {
    const saved = await save(
      baseUrl,
      cookie,
      seriesBody('Twenty eighth', 'monthly', '2026-01-28', '13:00', '14:00'),
    );
    expect(saved.body).toEqual({ result: 'ok', conflicts: [], continuesAfterWindow: true });
    expect(await stored(pool, 'Twenty eighth')).toMatchObject({
      repetition: 'monthly',
      month_day: 28,
      weekday: null,
      anchor_date: '2026-01-28',
    });
  });

  it('returns the monthly preview for a 31st and writes nothing', async () => {
    const before = await eventCount(pool);
    const rejected = await save(
      baseUrl,
      cookie,
      seriesBody('Thirty first', 'monthly', '2026-01-31'),
    );
    expect(rejected.status).toBe(400);
    expect(rejected.body.result).toBe('save_rejected');
    expect(rejected.body.monthTypes).toEqual([
      'February',
      'April',
      'June',
      'September',
      'November',
    ]);
    expect(rejected.body.missingDates).toEqual(['2026-02-31', '2026-04-31']);
    expect(JSON.stringify(rejected.body)).not.toContain('2027');
    expect(JSON.stringify(rejected.body)).not.toContain('owner@example.com');
    expect(await eventCount(pool)).toBe(before);
  });

  it('leaves a daily series daily when the edit selects monthly', async () => {
    const before = await stored(pool, 'Daily');
    const id = await idByTitle(pool, 'Daily');
    const changed = await save(baseUrl, cookie, seriesBody('Daily', 'monthly', '2026-01-15'), id);
    expect(changed).toEqual({ status: 400, body: { result: 'save_rejected' } });
    expect(await stored(pool, 'Daily')).toEqual(before);
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

function seriesBody(
  title: string,
  repetition: string,
  date: string,
  start = '09:00',
  end = '10:00',
) {
  return {
    title,
    repetition,
    start: { date, time: start },
    end: { date, time: end },
  };
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
      conflicts?: unknown[];
      continuesAfterWindow?: boolean;
      monthTypes?: string[];
      missingDates?: string[];
    },
  };
}

type StoredSeries = {
  repetition: string;
  anchor_date: string;
  local_start: string;
  local_end: string;
  weekday: number | null;
  month_day: number | null;
  start_instant: Date | null;
  end_instant: Date | null;
};

async function stored(pool: Pool, title: string): Promise<StoredSeries | undefined> {
  const result = await pool.query<StoredSeries>(
    `SELECT repetition, anchor_date::text, local_start::text, local_end::text,
            weekday, month_day, start_instant, end_instant
     FROM events WHERE title = $1`,
    [title],
  );
  return result.rows[0];
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
