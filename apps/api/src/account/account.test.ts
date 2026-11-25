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
import { displayName } from '../identity/display-name';
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

describe('PATCH /api/account', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-account-'));
  const port = 54336;
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
      throw new Error('account test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('stores a trimmed nickname and keeps the username when the nickname is blank', async () => {
    const code = await register(baseUrl, mail);
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const cookie = await login(baseUrl);
    expect(await patch(baseUrl, cookie, { nickname: '   ', email: 'other@example.com' })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    expect(await shownName(pool)).toEqual({
      stored: null,
      display: 'member',
      email: 'member@example.com',
    });
    expect(await patch(baseUrl, cookie, { nickname: ' Sam ' })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    expect(await shownName(pool)).toEqual({
      stored: 'Sam',
      display: 'Sam',
      email: 'member@example.com',
    });
    expect(await patch(baseUrl, cookie, { nickname: 'Sam Lee' })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    expect(await shownName(pool)).toEqual({
      stored: 'Sam Lee',
      display: 'Sam Lee',
      email: 'member@example.com',
    });
    expect(await eventCount(pool)).toBe(0);
  });

  it('returns logged_out and leaves the nickname in place', async () => {
    const cookie = await login(baseUrl);
    const missing = await patch(baseUrl, undefined, { nickname: 'Other' });
    const wrong = await patch(baseUrl, 'session=not-a-session', { nickname: 'Other' });
    await send(baseUrl, 'DELETE', '/api/sessions/current', cookie);
    const ended = await patch(baseUrl, cookie, { nickname: 'Other' });
    expect(missing).toEqual(wrong);
    expect(wrong).toEqual(ended);
    expect(ended).toEqual({ status: 401, body: { result: 'logged_out' } });
    expect(JSON.stringify(ended.body)).not.toContain('calendar');
    expect(JSON.stringify(ended.body)).not.toContain('event');
    expect(await shownName(pool)).toEqual({
      stored: 'Sam Lee',
      display: 'Sam Lee',
      email: 'member@example.com',
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

async function register(baseUrl: string, mail: RecordingMail): Promise<string> {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/registrations', {
    username: 'member',
    email: 'member@example.com',
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
    body: JSON.stringify({ email: 'member@example.com', password: 'secret-phrase' }),
  });
  expect(response.status).toBe(200);
  return response.headers.getSetCookie()[0]?.split(';')[0] ?? '';
}

async function post(
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<{ status: number; body: { result: string } }> {
  return send(baseUrl, 'POST', path, undefined, body);
}

async function patch(
  baseUrl: string,
  cookie: string | undefined,
  body: unknown,
): Promise<{ status: number; body: { result: string } }> {
  return send(baseUrl, 'PATCH', '/api/account', cookie, body);
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

async function shownName(
  pool: Pool,
): Promise<{ stored: string | null; display: string; email: string }> {
  const result = await pool.query<{ username: string; nickname: string | null; email: string }>(
    'SELECT username, nickname, email FROM accounts WHERE email = $1',
    ['member@example.com'],
  );
  const account = result.rows[0];
  if (account === undefined) {
    throw new Error('account missing');
  }
  return { stored: account.nickname, display: displayName(account), email: account.email };
}

async function eventCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT count(*)::text AS count FROM events');
  return Number(result.rows[0]?.count ?? 0);
}
