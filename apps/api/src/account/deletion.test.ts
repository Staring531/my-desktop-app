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
import { deleteOwnedAccount } from './account.service';
import { saveOwnedEvent } from '../events/event.service';
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

describe('DELETE /api/account', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-deletion-'));
  const port = 54347;
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
      throw new Error('deletion test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('removes the login, calendar, series, and detached event, and retires only the username', async () => {
    const code = await register(baseUrl, mail, 'owner', 'owner@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const cookie = await login(baseUrl, 'owner@example.com');
    expect(
      (await save(baseUrl, cookie, series('Weekly', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const weeklyId = await idByTitle(pool, 'Weekly');
    expect(
      await post(
        baseUrl,
        `/api/events/${weeklyId}/detach`,
        {
          title: 'Away',
          start: { date: '2026-06-10', time: '09:00' },
          end: { date: '2026-06-10', time: '10:00' },
          originalStart: '2026-06-10T13:00:00.000Z',
        },
        cookie,
      ),
    ).toMatchObject({ status: 200 });
    expect(
      (
        await save(
          baseUrl,
          cookie,
          series('Weekly', 'weekly', '2026-06-03', '10:00', '11:00'),
          weeklyId,
        )
      ).status,
    ).toBe(200);
    expect(
      (await save(baseUrl, cookie, series('Spring', 'daily', '2026-03-01', '02:30', '03:30')))
        .status,
    ).toBe(200);
    expect((await save(baseUrl, cookie, none('Solo', '2026-06-11', '11:00', '12:00'))).status).toBe(
      200,
    );
    expect(await count(pool, 'events')).toBeGreaterThanOrEqual(4);
    expect(await count(pool, 'series_freezes')).toBeGreaterThan(0);
    expect(await count(pool, 'series_skip_rules')).toBeGreaterThan(0);
    const before = await count(pool, 'events');

    const client = await pool.connect();
    try {
      const rolled = await deleteOwnedAccount(client, cookie, {
        beforeCommit: () => Promise.reject(new Error('stop')),
      });
      expect(rolled.result).toBe('operation_failed');
    } finally {
      client.release();
    }
    expect(await count(pool, 'events')).toBe(before);
    expect(await count(pool, 'retired_usernames')).toBe(0);
    expect((await read(baseUrl, cookie, '2026-06-03', '2026-06-11')).result).toBe('ok');

    expect(await remove(baseUrl, '')).toEqual({ status: 401, body: { result: 'logged_out' } });
    expect(await remove(baseUrl, cookie)).toEqual({ status: 200, body: { result: 'ok' } });
    expect(await count(pool, 'accounts')).toBe(0);
    expect(await count(pool, 'calendars')).toBe(0);
    expect(await count(pool, 'events')).toBe(0);
    expect(await count(pool, 'sessions')).toBe(0);
    expect(await count(pool, 'proofs')).toBe(0);
    expect(await count(pool, 'series_freezes')).toBe(0);
    expect(await count(pool, 'series_skip_rules')).toBe(0);
    expect(await retired(pool, 'owner')).toBe(true);
    expect(await loginResult(baseUrl, 'owner@example.com')).toEqual({
      status: 400,
      body: { result: 'login_rejected' },
    });
    expect(
      await post(baseUrl, '/api/registrations', registration('owner', 'fresh@example.com')),
    ).toEqual({ status: 400, body: { result: 'registration_rejected' } });
    const next = await register(baseUrl, mail, 'owner-next', 'owner@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code: next })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const nextCookie = await login(baseUrl, 'owner@example.com');
    const calendar = await read(baseUrl, nextCookie, '2026-01-01', '2026-12-31');
    expect(calendar.occurrences ?? []).toEqual([]);
    expect(JSON.stringify(calendar)).not.toContain('Solo');
    expect(JSON.stringify(calendar)).not.toContain('Weekly');
    expect(JSON.stringify(calendar)).not.toContain('Away');
  });

  it('lets the later commit decide between a save and deletion', async () => {
    const firstCode = await register(baseUrl, mail, 'racer', 'racer@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code: firstCode })).toMatchObject({
      status: 200,
    });
    const firstCookie = await login(baseUrl, 'racer@example.com');
    const leaderClient = await pool.connect();
    const followerClient = await pool.connect();
    const release = deferred<void>();
    const entered = deferred<void>();
    try {
      const leader = saveOwnedEvent(
        leaderClient,
        firstCookie,
        undefined,
        none('First', '2026-06-12', '09:00', '10:00'),
        {
          afterLock: async () => {
            entered.resolve();
            await release.promise;
          },
        },
      );
      await entered.promise;
      const follower = deleteOwnedAccount(followerClient, firstCookie);
      await waitForRowLock(pool);
      release.resolve();
      expect((await leader).body.result).toBe('ok');
      expect((await follower).result).toBe('ok');
    } finally {
      release.resolve();
      leaderClient.release();
      followerClient.release();
    }
    expect(await idByTitle(pool, 'First')).toBe('');
    expect(await retired(pool, 'racer')).toBe(true);

    const secondCode = await register(baseUrl, mail, 'later', 'later@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code: secondCode })).toMatchObject({
      status: 200,
    });
    const secondCookie = await login(baseUrl, 'later@example.com');
    const saveClient = await pool.connect();
    const held = deferred<void>();
    const ready = deferred<void>();
    try {
      const pending = saveOwnedEvent(
        saveClient,
        secondCookie,
        undefined,
        none('Second', '2026-06-12', '11:00', '12:00'),
        {
          beforeAccountLock: async () => {
            ready.resolve();
            await held.promise;
          },
        },
      );
      await ready.promise;
      expect(await remove(baseUrl, secondCookie)).toEqual({ status: 200, body: { result: 'ok' } });
      held.resolve();
      const saved = await pending;
      expect(saved.body).toEqual({ result: 'account_gone' });
      expect(saved.status).toBe(409);
    } finally {
      held.resolve();
      saveClient.release();
    }
    expect(await idByTitle(pool, 'Second')).toBe('');
    expect(await count(pool, 'events', 'later@example.com')).toBe(0);
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

function registration(username: string, email: string) {
  return { username, email, password: 'secret-phrase', timezone: 'America/New_York' };
}

async function register(baseUrl: string, mail: RecordingMail, username: string, email: string) {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/registrations', registration(username, email));
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

async function loginResult(baseUrl: string, email: string) {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret-phrase' }),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
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

async function remove(baseUrl: string, cookie: string) {
  const response = await fetch(`${baseUrl}/api/account`, {
    method: 'DELETE',
    headers: cookie === '' ? {} : { cookie },
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function read(baseUrl: string, cookie: string, from: string, to: string) {
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}`, {
    headers: { cookie },
  });
  return (await response.json()) as { result?: string; occurrences?: unknown[] };
}

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}

async function count(pool: Pool, table: string, email?: string): Promise<number> {
  if (email === undefined) {
    const result = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM ${table}`,
    );
    return Number(result.rows[0]?.count ?? 0);
  }
  const result = await pool.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM events
     WHERE creator_account_id = (SELECT id FROM accounts WHERE email = $1)`,
    [email],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function retired(pool: Pool, username: string): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM retired_usernames WHERE username = $1', [
    username,
  ]);
  return (result.rowCount ?? 0) > 0;
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
