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
import { proofCodeMatches } from '../results/secrets';
import { serializeSessionCookie } from './cookie';

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

describe('session cookie', () => {
  it('sets HttpOnly and SameSite without a lifetime, and adds Secure only for production HTTPS', () => {
    const plain = serializeSessionCookie('id.secret', false);
    const secure = serializeSessionCookie('id.secret', true);
    for (const header of [plain, secure]) {
      expect(header).toContain('HttpOnly');
      expect(header).toContain('SameSite=Lax');
      expect(header.toLowerCase()).not.toContain('max-age');
      expect(header.toLowerCase()).not.toContain('expires');
    }
    expect(plain).not.toContain('Secure');
    expect(secure).toContain('Secure');
  });
});

describe('POST /api/sessions', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-session-'));
  const port = 54334;
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
      throw new Error('session test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('rejects an unknown email, an unverified registration, and a wrong password alike', async () => {
    await register(baseUrl, mail, 'pending', 'pending@example.com');
    const code = await register(baseUrl, mail, 'member', 'member@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const unknown = await post(baseUrl, '/api/sessions', {
      email: 'missing@example.com',
      password: 'secret-phrase',
    });
    const unverified = await post(baseUrl, '/api/sessions', {
      email: 'pending@example.com',
      password: 'secret-phrase',
    });
    const wrong = await post(baseUrl, '/api/sessions', {
      email: 'member@example.com',
      password: 'wrong-phrase',
    });
    expect(unknown).toEqual(unverified);
    expect(unverified).toEqual(wrong);
    expect(wrong).toEqual({ status: 400, body: { result: 'login_rejected' } });
    expect(JSON.stringify(wrong.body)).not.toContain('member@example.com');
    expect(JSON.stringify(wrong.body)).not.toContain('secret-phrase');
    expect(await sessionCount(pool)).toBe(0);
  });

  it('returns a session cookie with no lifetime and stores only the secret hash', async () => {
    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'member@example.com', password: 'secret-phrase' }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: 'ok' });
    const header = setCookieHeader(response);
    expect(header.toLowerCase()).not.toContain('max-age');
    expect(header.toLowerCase()).not.toContain('expires');
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
    const presented = presentedSecret(header);
    const stored = await pool.query<{ secret_hash: string }>(
      'SELECT secret_hash FROM sessions WHERE id = $1',
      [presented.sessionId],
    );
    expect(stored.rows[0]?.secret_hash).not.toContain(presented.secret);
    expect(proofCodeMatches(presented.secret, stored.rows[0]?.secret_hash ?? '')).toBe(true);
  });

  it('ends only the presented session and answers the next request as logged out', async () => {
    const first = await login(baseUrl, 'member@example.com');
    const second = await login(baseUrl, 'member@example.com');
    const ended = await send(baseUrl, 'DELETE', '/api/sessions/current', first.cookie);
    expect(ended).toEqual({ status: 200, body: { result: 'ok' } });
    const rows = await pool.query<{ id: string; ended_at: Date | null }>(
      'SELECT id, ended_at FROM sessions WHERE id = ANY($1::uuid[])',
      [[first.sessionId, second.sessionId]],
    );
    const byId = new Map(rows.rows.map((row) => [row.id, row.ended_at]));
    expect(byId.get(first.sessionId)).not.toBeNull();
    expect(byId.get(second.sessionId)).toBeNull();
    const again = await send(baseUrl, 'DELETE', '/api/sessions/current', first.cookie);
    expect(again).toEqual({ status: 401, body: { result: 'logged_out' } });
    expect(JSON.stringify(again.body)).not.toContain('calendar');
    expect(JSON.stringify(again.body)).not.toContain('event');
    const other = await send(baseUrl, 'DELETE', '/api/sessions/current', second.cookie);
    expect(other).toEqual({ status: 200, body: { result: 'ok' } });
  });

  it('rejects a missing cookie, an unknown id, and a wrong secret', async () => {
    const open = await login(baseUrl, 'member@example.com');
    const missing = await send(baseUrl, 'DELETE', '/api/sessions/current');
    const unknown = await send(
      baseUrl,
      'DELETE',
      '/api/sessions/current',
      `session=${randomUUID()}.not-the-secret`,
    );
    const wrongSecret = await send(
      baseUrl,
      'DELETE',
      '/api/sessions/current',
      `session=${encodeURIComponent(`${open.sessionId}.wrong-secret`)}`,
    );
    expect(missing).toEqual(unknown);
    expect(unknown).toEqual(wrongSecret);
    expect(wrongSecret).toEqual({ status: 401, body: { result: 'logged_out' } });
    const stillOpen = await pool.query<{ ended_at: Date | null }>(
      'SELECT ended_at FROM sessions WHERE id = $1',
      [open.sessionId],
    );
    expect(stillOpen.rows[0]?.ended_at).toBeNull();
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

async function login(
  baseUrl: string,
  email: string,
): Promise<{ cookie: string; sessionId: string }> {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret-phrase' }),
  });
  expect(response.status).toBe(200);
  const header = setCookieHeader(response);
  const presented = presentedSecret(header);
  return {
    cookie: `session=${encodeURIComponent(`${presented.sessionId}.${presented.secret}`)}`,
    sessionId: presented.sessionId,
  };
}

async function post(
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<{ status: number; body: { result: string } }> {
  return send(baseUrl, 'POST', path, undefined, body);
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

function setCookieHeader(response: Response): string {
  return response.headers.getSetCookie()[0] ?? '';
}

function presentedSecret(header: string): { sessionId: string; secret: string } {
  const pair = header.split(';')[0] ?? '';
  const raw = decodeURIComponent(pair.slice('session='.length));
  const dot = raw.indexOf('.');
  return { sessionId: raw.slice(0, dot), secret: raw.slice(dot + 1) };
}

async function sessionCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM sessions',
  );
  return Number(result.rows[0]?.count ?? 0);
}
