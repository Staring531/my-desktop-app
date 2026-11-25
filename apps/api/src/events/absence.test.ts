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
import { deleteOwnedOccurrence, saveOwnedEvent } from './event.service';

const require = createRequire(__filename);
const now = new Date('2026-05-01T16:00:00.000Z');

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

describe('delete one occurrence', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-absence-'));
  const port = 54344;
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
      throw new Error('absence test server has no port');
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

  it('keeps a deleted Wednesday absent after the series moves to Thursday', async () => {
    const before = await eventCount(pool);
    expect(
      (await save(baseUrl, cookie, series('Weekly', 'weekly', '2026-05-06', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const seriesId = await idByTitle(pool, 'Weekly');
    expect(await remove(baseUrl, cookie, seriesId, '2026-05-06T13:00:00.000Z')).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    expect(await eventCount(pool)).toBe(before + 1);
    const deleted = await read(baseUrl, cookie, '2026-05-06', '2026-05-06');
    expect(deleted.occurrences ?? []).toEqual([]);
    expect(JSON.stringify(deleted)).not.toContain('cancelled');
    const absence = await pool.query<{ civil_date: string; original_start_instant: Date }>(
      `SELECT civil_date::text, original_start_instant FROM series_absences WHERE series_event_id = $1`,
      [seriesId],
    );
    expect(absence.rows[0]?.civil_date).toBe('2026-05-06');
    expect(absence.rows[0]?.original_start_instant.toISOString()).toBe('2026-05-06T13:00:00.000Z');
    expect(
      (
        await save(
          baseUrl,
          cookie,
          series('Weekly', 'weekly', '2026-05-07', '09:00', '10:00'),
          seriesId,
        )
      ).status,
    ).toBe(200);
    const moved = await read(baseUrl, cookie, '2026-05-06', '2026-05-14');
    expect(moved.occurrences?.map((row) => row.date)).toEqual(['2026-05-07', '2026-05-14']);
    expect(await absenceCount(pool, seriesId)).toBe(1);
    await pool.query(`UPDATE accounts SET timezone = 'America/Los_Angeles'`);
    const shifted = await read(baseUrl, cookie, '2026-05-06', '2026-05-07');
    expect(shifted.occurrences?.map((row) => row.date)).toEqual(['2026-05-07']);
    expect(shifted.occurrences?.[0]?.start).toBe('2026-05-07T16:00:00.000Z');
    expect(JSON.stringify(shifted)).not.toContain('cancelled');
    await pool.query(`UPDATE accounts SET timezone = 'America/New_York'`);
  });

  it('leaves the deleted date empty when a later clock is saved before that date starts', async () => {
    expect(
      (await save(baseUrl, cookie, series('Wednesdays', 'weekly', '2026-05-13', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const weeklyId = await idByTitle(pool, 'Wednesdays');
    expect(await remove(baseUrl, cookie, weeklyId, '2026-05-13T13:00:00.000Z')).toMatchObject({
      status: 200,
    });
    expect(
      (
        await save(
          baseUrl,
          cookie,
          series('Wednesdays', 'weekly', '2026-05-20', '15:00', '16:00'),
          weeklyId,
        )
      ).status,
    ).toBe(200);
    const weekly = named(await read(baseUrl, cookie, '2026-05-13', '2026-05-20'), 'Wednesdays');
    expect(weekly.map((row) => row.date)).toEqual(['2026-05-20']);
    expect(weekly[0]?.start).toBe('2026-05-20T19:00:00.000Z');

    expect(
      (await save(baseUrl, cookie, series('Days', 'daily', '2026-05-11', '09:00', '10:00'))).status,
    ).toBe(200);
    const dailyId = await idByTitle(pool, 'Days');
    expect(await remove(baseUrl, cookie, dailyId, '2026-05-12T13:00:00.000Z')).toMatchObject({
      status: 200,
    });
    expect(
      (
        await save(
          baseUrl,
          cookie,
          series('Days', 'daily', '2026-05-11', '15:00', '16:00'),
          dailyId,
        )
      ).status,
    ).toBe(200);
    const daily = named(await read(baseUrl, cookie, '2026-05-12', '2026-05-13'), 'Days');
    expect(daily.map((row) => [row.date, row.start])).toEqual([
      ['2026-05-13', '2026-05-13T19:00:00.000Z'],
    ]);

    expect(
      (await save(baseUrl, cookie, series('Months', 'monthly', '2026-05-12', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const monthlyId = await idByTitle(pool, 'Months');
    expect(await remove(baseUrl, cookie, monthlyId, '2026-06-12T13:00:00.000Z')).toMatchObject({
      status: 200,
    });
    expect(
      (
        await save(
          baseUrl,
          cookie,
          series('Months', 'monthly', '2026-05-12', '15:00', '16:00'),
          monthlyId,
        )
      ).status,
    ).toBe(200);
    const monthly = named(await read(baseUrl, cookie, '2026-06-12', '2026-07-12'), 'Months');
    expect(monthly.map((row) => [row.date, row.start])).toEqual([
      ['2026-07-12', '2026-07-12T19:00:00.000Z'],
    ]);
  });

  it('lets the later commit decide and writes nothing when the delete rolls back', async () => {
    expect(
      (await save(baseUrl, cookie, series('Later', 'weekly', '2026-05-27', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const seriesId = await idByTitle(pool, 'Later');
    const client = await pool.connect();
    try {
      const rolled = await deleteOwnedOccurrence(
        client,
        cookie,
        seriesId,
        { originalStart: '2026-05-27T13:00:00.000Z' },
        {
          beforeCommit: () => Promise.reject(new Error('stop')),
        },
      );
      expect(rolled.body.result).toBe('operation_failed');
    } finally {
      client.release();
    }
    expect(await absenceCount(pool, seriesId)).toBe(0);
    expect(named(await read(baseUrl, cookie, '2026-05-27', '2026-05-27'), 'Later')).toHaveLength(1);

    const first = await pool.connect();
    const second = await pool.connect();
    const release = deferred<void>();
    const entered = deferred<void>();
    try {
      const leader = saveOwnedEvent(
        first,
        cookie,
        seriesId,
        series('Later', 'weekly', '2026-05-27', '10:00', '11:00'),
        {
          afterLock: async () => {
            entered.resolve();
            await release.promise;
          },
        },
      );
      await entered.promise;
      const follower = deleteOwnedOccurrence(second, cookie, seriesId, {
        originalStart: '2026-05-27T13:00:00.000Z',
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
    expect(named(await read(baseUrl, cookie, '2026-05-27', '2026-05-27'), 'Later')).toEqual([]);
    const stored = await pool.query<{ original_start_instant: Date }>(
      'SELECT original_start_instant FROM series_absences WHERE series_event_id = $1',
      [seriesId],
    );
    expect(stored.rows[0]?.original_start_instant.toISOString()).toBe('2026-05-27T13:00:00.000Z');
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

function named(
  body: { occurrences?: Array<{ title?: string; date?: string; start?: string }> },
  title: string,
) {
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

async function save(baseUrl: string, cookie: string, body: unknown, id?: string) {
  const response = await fetch(
    `${baseUrl}${id === undefined ? '/api/events' : `/api/events/${id}`}`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    },
  );
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function remove(baseUrl: string, cookie: string, id: string, originalStart: string) {
  const response = await fetch(`${baseUrl}/api/events/${id}/occurrences`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ originalStart }),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function read(baseUrl: string, cookie: string, from: string, to: string) {
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}`, {
    headers: { cookie },
  });
  return (await response.json()) as {
    occurrences?: Array<{ title?: string; date?: string; start?: string; state?: string }>;
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

async function absenceCount(pool: Pool, seriesId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM series_absences WHERE series_event_id = $1',
    [seriesId],
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
  throw new Error('the deletion did not wait on the locked row');
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
