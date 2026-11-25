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

describe('GET /api/calendar', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-calendar-'));
  const port = 54337;
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
  let ownerCookie = '';
  let ownerCalendarId = '';
  const publicId = randomUUID();
  const privateId = randomUUID();

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
      throw new Error('calendar test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    const code = await register(baseUrl, mail, 'owner', 'owner@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    ownerCookie = await login(baseUrl, 'owner@example.com');
    const owner = await account(pool, 'owner@example.com');
    ownerCalendarId = owner.calendarId;
    await insertEvent(pool, {
      id: publicId,
      calendarId: owner.calendarId,
      accountId: owner.id,
      title: 'Public focus',
      visibility: 'public',
      start: '2026-03-02T15:00:00.000Z',
      end: '2026-03-02T16:00:00.000Z',
    });
    await insertEvent(pool, {
      id: privateId,
      calendarId: owner.calendarId,
      accountId: owner.id,
      title: 'Private focus',
      visibility: 'private',
      start: '2026-03-02T18:00:00.000Z',
      end: '2026-03-02T19:00:00.000Z',
    });
    await insertEvent(pool, {
      id: randomUUID(),
      calendarId: owner.calendarId,
      accountId: owner.id,
      title: 'Later focus',
      visibility: 'private',
      start: '2026-04-10T15:00:00.000Z',
      end: '2026-04-10T16:00:00.000Z',
    });
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('shows the owner which stored event is public and which is private', async () => {
    const eventsBefore = await eventCount(pool);
    expect(await patch(baseUrl, ownerCookie, { nickname: ' Sam ' })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const response = await read(baseUrl, ownerCookie, '2026-03-01', '2026-03-31', ownerCalendarId);
    expect(response.status).toBe(200);
    expect(response.body.result).toBe('ok');
    expect(response.body.calendar).toEqual({ id: ownerCalendarId, kind: 'personal' });
    expect(response.body.occurrences).toEqual([
      occurrence(
        publicId,
        'public',
        'Public focus',
        '2026-03-02T15:00:00.000Z',
        '2026-03-02T16:00:00.000Z',
      ),
      occurrence(
        privateId,
        'private',
        'Private focus',
        '2026-03-02T18:00:00.000Z',
        '2026-03-02T19:00:00.000Z',
      ),
    ]);
    const text = JSON.stringify(response.body);
    expect(text).not.toContain('owner@example.com');
    expect(text).not.toContain('Later focus');
    expect(await eventCount(pool)).toBe(eventsBefore);
  });

  it('limits the read to the requested civil dates', async () => {
    const response = await read(baseUrl, ownerCookie, '2026-04-01', '2026-04-30');
    expect(response.status).toBe(200);
    expect(response.body.calendar).toEqual({ id: ownerCalendarId, kind: 'personal' });
    expect(response.body.occurrences?.map((item) => item.title)).toEqual(['Later focus']);
  });

  it('gives another logged-in account neither this calendar nor these events', async () => {
    const code = await register(baseUrl, mail, 'other', 'other@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const other = await account(pool, 'other@example.com');
    const cookie = await login(baseUrl, 'other@example.com');
    const response = await read(baseUrl, cookie, '2026-03-01', '2026-03-31', ownerCalendarId);
    expect(response.status).toBe(200);
    expect(response.body.calendar).toEqual({ id: other.calendarId, kind: 'personal' });
    expect(response.body.occurrences).toEqual([]);
    const text = JSON.stringify(response.body);
    expect(text).not.toContain(ownerCalendarId);
    expect(text).not.toContain('Public focus');
    expect(text).not.toContain('Private focus');
    expect(text).not.toContain('@');
  });

  it('returns logged_out with no calendar and no event', async () => {
    const missing = await read(baseUrl, undefined, '2026-03-01', '2026-03-31', ownerCalendarId);
    await send(baseUrl, 'DELETE', '/api/sessions/current', ownerCookie);
    const ended = await read(baseUrl, ownerCookie, '2026-03-01', '2026-03-31');
    expect(missing).toEqual(ended);
    expect(ended).toEqual({ status: 401, body: { result: 'logged_out' } });
    const text = JSON.stringify(ended.body);
    expect(text).not.toContain('calendar');
    expect(text).not.toContain('event');
    expect(text).not.toContain('Public focus');
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

function occurrence(
  id: string,
  visibility: 'public' | 'private',
  title: string,
  start: string,
  end: string,
) {
  return {
    id,
    state: 'scheduled',
    visibility,
    title,
    location: 'Room',
    description: 'Notes',
    displayName: 'Sam',
    date: start.slice(0, 10),
    start,
    end,
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

async function patch(baseUrl: string, cookie: string, body: unknown) {
  return send(baseUrl, 'PATCH', '/api/account', cookie, body);
}

type CalendarResponse = {
  status: number;
  body: {
    result: string;
    calendar?: { id: string; kind: string };
    occurrences?: Array<{ title: string }>;
  };
};

async function read(
  baseUrl: string,
  cookie: string | undefined,
  from: string,
  to: string,
  accountId?: string,
): Promise<CalendarResponse> {
  const account = accountId === undefined ? '' : `&accountId=${accountId}`;
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}${account}`, {
    headers: cookie === undefined ? {} : { cookie },
  });
  return { status: response.status, body: (await response.json()) as CalendarResponse['body'] };
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

async function account(pool: Pool, email: string): Promise<{ id: string; calendarId: string }> {
  const result = await pool.query<{ id: string; calendar_id: string }>(
    `SELECT a.id, c.id AS calendar_id
     FROM accounts a
     JOIN calendars c ON c.owner_account_id = a.id
     WHERE a.email = $1`,
    [email],
  );
  const row = result.rows[0];
  if (row === undefined) {
    throw new Error('account missing');
  }
  return { id: row.id, calendarId: row.calendar_id };
}

async function insertEvent(
  pool: Pool,
  event: {
    id: string;
    calendarId: string;
    accountId: string;
    title: string;
    visibility: 'public' | 'private';
    start: string;
    end: string;
  },
): Promise<void> {
  await pool.query(
    `INSERT INTO events (
       id, calendar_id, creator_account_id, repetition, title, location, description, visibility,
       start_instant, end_instant
     ) VALUES ($1, $2, $3, 'none', $4, 'Room', 'Notes', $5, $6, $7)`,
    [
      event.id,
      event.calendarId,
      event.accountId,
      event.title,
      event.visibility,
      event.start,
      event.end,
    ],
  );
}

async function eventCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT count(*)::text AS count FROM events');
  return Number(result.rows[0]?.count ?? 0);
}
