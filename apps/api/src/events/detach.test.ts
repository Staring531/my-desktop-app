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
import { detachOwnedEvent, saveOwnedEvent } from './event.service';

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

describe('detach one occurrence and delete the series', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-detach-'));
  const port = 54343;
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
      throw new Error('detach test server has no port');
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

  it('keeps a detached occurrence after a series change and after series deletion', async () => {
    expect(
      (await save(baseUrl, cookie, series('Plan', '2026-06-02', '09:00', '10:00'))).status,
    ).toBe(200);
    const seriesId = await idByTitle(pool, 'Plan');
    const detached = await send(baseUrl, 'POST', `/api/events/${seriesId}/detach`, cookie, {
      originalStart: '2026-06-02T13:00:00.000Z',
      title: 'Solo',
      visibility: 'public',
      location: 'Hall',
      description: 'Kept',
      start: { date: '2026-06-02', time: '09:00' },
      end: { date: '2026-06-03', time: '10:00' },
    });
    expect(detached.status).toBe(200);
    const before = await read(baseUrl, cookie, '2026-06-02', '2026-06-03');
    expect(named(before.occurrences, 'Solo')).toMatchObject([
      { visibility: 'public', date: '2026-06-02', start: '2026-06-02T13:00:00.000Z' },
    ]);
    expect(named(before.occurrences, 'Plan').map((row) => row.date)).toEqual(['2026-06-03']);
    const warned = await save(
      baseUrl,
      cookie,
      series('Plan', '2026-06-02', '09:00', '10:00', 'private'),
      seriesId,
    );
    expect(warned.body.conflicts).toEqual([
      {
        title: 'Solo',
        start: '2026-06-02T13:00:00.000Z',
        end: '2026-06-03T14:00:00.000Z',
      },
    ]);
    expect(warned.body.continuesAfterWindow).toBe(true);
    const moved = await save(
      baseUrl,
      cookie,
      series('Plan', '2026-06-02', '15:00', '16:00', 'private'),
      seriesId,
    );
    expect(moved.status).toBe(200);
    const after = await read(baseUrl, cookie, '2026-06-02', '2026-06-11');
    expect(named(after.occurrences, 'Solo')).toEqual([
      expect.objectContaining({
        visibility: 'public',
        location: 'Hall',
        description: 'Kept',
        start: '2026-06-02T13:00:00.000Z',
        end: '2026-06-03T14:00:00.000Z',
      }),
    ]);
    const plan = named(after.occurrences, 'Plan');
    expect(plan.find((row) => row.date === '2026-06-02')).toBeUndefined();
    expect(plan.find((row) => row.date === '2026-06-03')).toEqual(
      expect.objectContaining({
        visibility: 'private',
        start: '2026-06-03T13:00:00.000Z',
        end: '2026-06-03T14:00:00.000Z',
      }),
    );
    expect(plan.find((row) => row.date === '2026-06-11')).toEqual(
      expect.objectContaining({
        visibility: 'private',
        start: '2026-06-11T19:00:00.000Z',
        end: '2026-06-11T20:00:00.000Z',
      }),
    );
    await pool.query(
      `INSERT INTO series_absences (series_event_id, original_start_instant, civil_date)
       VALUES ($1, '2026-06-04T13:00:00.000Z', '2026-06-04')`,
      [seriesId],
    );
    expect(await send(baseUrl, 'DELETE', `/api/events/${seriesId}`, cookie)).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const remaining = await read(baseUrl, cookie, '2026-06-02', '2026-06-11');
    expect(remaining.occurrences?.map((row) => row.title)).toEqual(['Solo']);
    const solo = await pool.query<{ detached_from_event_id: string }>(
      'SELECT detached_from_event_id FROM events WHERE title = $1',
      ['Solo'],
    );
    expect(solo.rows[0]?.detached_from_event_id).toBe(seriesId);
    expect(await count(pool, 'series_absences')).toBe(0);
    expect(await count(pool, 'series_freezes')).toBe(0);
    expect(await count(pool, 'events')).toBe(1);
  });

  it('stores the detachment that commits after a series time save', async () => {
    expect(
      (await save(baseUrl, cookie, series('Later', '2026-06-04', '09:00', '10:00'))).status,
    ).toBe(200);
    const seriesId = await idByTitle(pool, 'Later');
    const first = await pool.connect();
    const second = await pool.connect();
    const release = deferred<void>();
    const entered = deferred<void>();
    try {
      const leader = saveOwnedEvent(
        first,
        cookie,
        seriesId,
        series('Later', '2026-06-04', '10:00', '11:00'),
        {
          afterLock: async () => {
            entered.resolve();
            await release.promise;
          },
        },
      );
      await entered.promise;
      const follower = detachOwnedEvent(second, cookie, seriesId, {
        originalStart: '2026-06-04T13:00:00.000Z',
        title: 'Solo',
        start: { date: '2026-06-04', time: '09:00' },
        end: { date: '2026-06-04', time: '10:00' },
      });
      await waitForRowLock(pool);
      release.resolve();
      expect((await leader).body.result).toBe('ok');
      expect((await follower).body.result).toBe('ok');
    } finally {
      release.resolve();
      first.release();
      second.release();
    }
    const rows = await pool.query<{ title: string; start_instant: Date; end_instant: Date }>(
      `SELECT title, start_instant, end_instant FROM events WHERE title = 'Solo' AND detached_from_event_id = $1`,
      [seriesId],
    );
    expect(
      rows.rows.map((row) => [row.start_instant.toISOString(), row.end_instant.toISOString()]),
    ).toEqual([['2026-06-04T13:00:00.000Z', '2026-06-04T14:00:00.000Z']]);
    const calendar = await read(baseUrl, cookie, '2026-06-04', '2026-06-04');
    expect(calendar.occurrences?.map((row) => row.title)).toEqual(['Solo']);
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

function series(title: string, date: string, start: string, end: string, visibility = 'private') {
  return {
    title,
    repetition: 'daily',
    visibility,
    start: { date, time: start },
    end: { date, time: end },
  };
}

function named(
  occurrences:
    Array<{ title?: string; date?: string; visibility?: string; start?: string }> | undefined,
  title: string,
) {
  return occurrences?.filter((row) => row.title === title) ?? [];
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
  return send(baseUrl, 'POST', path, undefined, body);
}

async function save(baseUrl: string, cookie: string, body: unknown, id?: string) {
  const response = await send(
    baseUrl,
    'PUT',
    id === undefined ? '/api/events' : `/api/events/${id}`,
    cookie,
    body,
  );
  return {
    status: response.status,
    body: response.body as {
      result: string;
      conflicts?: Array<{ title: string; start: string; end: string }>;
      continuesAfterWindow?: boolean;
    },
  };
}

async function send(
  baseUrl: string,
  method: string,
  path: string,
  cookie?: string,
  body?: unknown,
) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(cookie === undefined ? {} : { cookie }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function read(baseUrl: string, cookie: string, from: string, to: string) {
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}`, {
    headers: { cookie },
  });
  return (await response.json()) as {
    occurrences?: Array<{
      title?: string;
      date?: string;
      visibility?: string;
      location?: string;
      description?: string;
      start?: string;
      end?: string;
    }>;
  };
}

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}

async function count(pool: Pool, table: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM ${table}`,
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function waitForRowLock(pool: Pool): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const locks = await pool.query(
      "SELECT 1 FROM pg_locks WHERE NOT granted AND locktype IN ('tuple', 'transactionid') LIMIT 1",
    );
    if ((locks.rowCount ?? 0) > 0) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
  }
  throw new Error('the detachment did not wait on the locked row');
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
