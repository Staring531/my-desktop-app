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
import { deleteOwnedEvent, saveOwnedEvent } from './event.service';

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

const crossingConflict = {
  title: 'Crossing',
  start: '2020-01-03T14:00:00.000Z',
  end: '2099-01-03T15:00:00.000Z',
};

describe('PUT /api/events', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-events-'));
  const port = 54338;
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
  let focusId = '';

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
      throw new Error('event test server has no port');
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

  it('stores a private timed event and rejects an empty title, a date-only value, and an end that is not later', async () => {
    expect(await put(baseUrl, cookie, undefined, eventBody('  Focus  ', '09:00', '10:00'))).toEqual(
      {
        status: 200,
        body: { result: 'ok', conflicts: [] },
      },
    );
    focusId = await idByTitle(pool, 'Focus');
    expect(await stored(pool, focusId)).toMatchObject({
      title: 'Focus',
      visibility: 'private',
      location: '',
      description: '',
      start: '2026-06-02T13:00:00.000Z',
      end: '2026-06-02T14:00:00.000Z',
    });
    const count = await eventCount(pool);
    const empty = await put(baseUrl, cookie, undefined, eventBody('   ', '09:00', '10:00'));
    const dateOnly = await put(baseUrl, cookie, undefined, {
      title: 'Date only',
      repetition: 'none',
      start: { date: '2026-06-02' },
      end: { date: '2026-06-02', time: '10:00' },
    });
    const backwards = await put(
      baseUrl,
      cookie,
      undefined,
      eventBody('Backwards', '10:00', '09:00'),
    );
    expect(empty).toEqual(dateOnly);
    expect(dateOnly).toEqual(backwards);
    expect(backwards).toEqual({ status: 400, body: { result: 'save_rejected' } });
    expect(await eventCount(pool)).toBe(count);
  });

  it('keeps a past event, an event that crosses now, a future event, and a public choice', async () => {
    expect(
      await put(baseUrl, cookie, undefined, eventBody('Ended', '09:00', '10:00', '2020-01-02')),
    ).toEqual({
      status: 200,
      body: { result: 'ok', conflicts: [] },
    });
    expect(
      await put(
        baseUrl,
        cookie,
        undefined,
        eventBody('Crossing', '09:00', '10:00', '2020-01-03', '2099-01-03'),
      ),
    ).toEqual({ status: 200, body: { result: 'ok', conflicts: [] } });
    expect(
      await put(baseUrl, cookie, undefined, eventBody('Later', '09:00', '10:00', '2099-06-02')),
    ).toEqual({
      status: 200,
      body: { result: 'ok', conflicts: [] },
    });
    expect(
      await put(baseUrl, cookie, undefined, {
        ...eventBody('Public focus', '11:00', '12:00'),
        visibility: 'public',
      }),
    ).toEqual({ status: 200, body: { result: 'ok', conflicts: [crossingConflict] } });
    const ended = await read(baseUrl, cookie, '2020-01-01', '2020-01-02');
    expect(ended.body.occurrences?.map((item) => item.title)).toEqual(['Ended']);
    expect(await stored(pool, await idByTitle(pool, 'Public focus'))).toMatchObject({
      visibility: 'public',
    });
    expect(await stored(pool, await idByTitle(pool, 'Crossing'))).toMatchObject({
      start: '2020-01-03T14:00:00.000Z',
      end: '2099-01-03T15:00:00.000Z',
    });
  });

  it('replaces the stored event with the edited title and time', async () => {
    expect(
      await put(baseUrl, cookie, focusId, {
        ...eventBody('Deep work', '11:00', '12:00'),
        location: 'Desk',
        description: 'Notes',
      }),
    ).toEqual({
      status: 200,
      body: {
        result: 'ok',
        conflicts: [
          crossingConflict,
          {
            title: 'Public focus',
            start: '2026-06-02T15:00:00.000Z',
            end: '2026-06-02T16:00:00.000Z',
          },
        ],
      },
    });
    expect(await stored(pool, focusId)).toMatchObject({
      title: 'Deep work',
      location: 'Desk',
      description: 'Notes',
      visibility: 'private',
      start: '2026-06-02T15:00:00.000Z',
      end: '2026-06-02T16:00:00.000Z',
    });
    const june = await read(baseUrl, cookie, '2026-06-01', '2026-06-03');
    expect(june.body.occurrences?.map((item) => item.title).sort()).toEqual([
      'Deep work',
      'Public focus',
    ]);
  });

  it('keeps the complete content of the save that commits last', async () => {
    const first = await pool.connect();
    const second = await pool.connect();
    const release = deferred<void>();
    const entered = deferred<void>();
    try {
      const leader = saveOwnedEvent(
        first,
        cookie,
        focusId,
        eventBody('First save', '09:00', '10:00'),
        {
          afterLock: async () => {
            entered.resolve();
            await release.promise;
          },
        },
      );
      await entered.promise;
      const follower = saveOwnedEvent(second, cookie, focusId, {
        ...eventBody('Last save', '13:00', '14:00'),
        location: 'Hall',
        description: 'Final',
        visibility: 'public',
      });
      await waitForRowLock(pool);
      release.resolve();
      expect((await leader).body).toEqual({ result: 'ok', conflicts: [crossingConflict] });
      expect((await follower).body).toEqual({ result: 'ok', conflicts: [crossingConflict] });
    } finally {
      first.release();
      second.release();
    }
    expect(await stored(pool, focusId)).toEqual({
      title: 'Last save',
      visibility: 'public',
      location: 'Hall',
      description: 'Final',
      start: '2026-06-02T17:00:00.000Z',
      end: '2026-06-02T18:00:00.000Z',
    });
  });

  it('leaves the row when a delete rolls back and removes it when the delete commits', async () => {
    const client = await pool.connect();
    try {
      const rolled = await deleteOwnedEvent(client, cookie, focusId, {
        beforeCommit: async () => {
          throw new Error('rollback');
        },
      });
      expect(rolled.body).toEqual({ result: 'operation_failed' });
    } finally {
      client.release();
    }
    expect(await stored(pool, focusId)).toMatchObject({ title: 'Last save' });
    expect(await send(baseUrl, 'DELETE', `/api/events/${focusId}`, cookie)).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    expect(await stored(pool, focusId)).toBeUndefined();
    const june = await read(baseUrl, cookie, '2026-06-01', '2026-06-03');
    expect(june.body.occurrences?.map((item) => item.title)).toEqual(['Public focus']);
  });

  it('uses not_found for a missing event and another account event', async () => {
    const publicId = await idByTitle(pool, 'Public focus');
    const before = await stored(pool, publicId);
    const code = await register(baseUrl, mail, 'other', 'other@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const other = await login(baseUrl, 'other@example.com');
    const missing = await put(
      baseUrl,
      cookie,
      randomUUID(),
      eventBody('Missing', '09:00', '10:00'),
    );
    const foreign = await put(baseUrl, other, publicId, eventBody('Taken', '09:00', '10:00'));
    const foreignDelete = await send(baseUrl, 'DELETE', `/api/events/${publicId}`, other);
    expect(missing).toEqual(foreign);
    expect(foreign).toEqual(foreignDelete);
    expect(foreignDelete).toEqual({ status: 404, body: { result: 'not_found' } });
    expect(await stored(pool, publicId)).toEqual(before);
  });

  it('returns logged_out and account_gone without writing', async () => {
    const publicId = await idByTitle(pool, 'Public focus');
    const before = await eventCount(pool);
    const missing = await put(baseUrl, undefined, undefined, eventBody('Hidden', '09:00', '10:00'));
    expect(missing).toEqual({ status: 401, body: { result: 'logged_out' } });
    const code = await register(baseUrl, mail, 'gone', 'gone@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const goneCookie = await login(baseUrl, 'gone@example.com');
    const client = await pool.connect();
    try {
      const gone = await saveOwnedEvent(
        client,
        goneCookie,
        undefined,
        eventBody('After delete', '09:00', '10:00'),
        {
          beforeAccountLock: async () => {
            await pool.query('DELETE FROM accounts WHERE email = $1', ['gone@example.com']);
          },
        },
      );
      expect(gone.body).toEqual({ result: 'account_gone' });
      expect(gone.status).toBe(409);
    } finally {
      client.release();
    }
    expect(await eventCount(pool)).toBe(before);
    expect(await stored(pool, publicId)).toMatchObject({ title: 'Public focus' });
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

function eventBody(
  title: string,
  start: string,
  end: string,
  startDate = '2026-06-02',
  endDate = startDate,
) {
  return {
    title,
    repetition: 'none',
    start: { date: startDate, time: start },
    end: { date: endDate, time: end },
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
  return send(baseUrl, 'POST', path, undefined, body);
}

async function put(
  baseUrl: string,
  cookie: string | undefined,
  id: string | undefined,
  body: unknown,
) {
  const path = id === undefined ? '/api/events' : `/api/events/${id}`;
  return send(baseUrl, 'PUT', path, cookie, body);
}

async function read(baseUrl: string, cookie: string, from: string, to: string) {
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}`, {
    headers: { cookie },
  });
  return {
    status: response.status,
    body: (await response.json()) as { occurrences?: Array<{ title: string }> },
  };
}

async function send(
  baseUrl: string,
  method: string,
  path: string,
  cookie?: string,
  body?: unknown,
): Promise<{ status: number; body: { result: string } }> {
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

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}

async function stored(pool: Pool, id: string) {
  const result = await pool.query<{
    title: string;
    visibility: string;
    location: string;
    description: string;
    start_instant: Date;
    end_instant: Date;
  }>(
    `SELECT title, visibility, location, description, start_instant, end_instant
     FROM events WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (row === undefined) {
    return undefined;
  }
  return {
    title: row.title,
    visibility: row.visibility,
    location: row.location,
    description: row.description,
    start: row.start_instant.toISOString(),
    end: row.end_instant.toISOString(),
  };
}

async function eventCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT count(*)::text AS count FROM events');
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
  throw new Error('the later save did not wait on the locked row');
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
