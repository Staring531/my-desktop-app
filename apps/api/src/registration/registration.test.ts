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
import { passwordMatches, proofCodeMatches } from '../results/secrets';

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

describe('POST /api/registrations', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-register-'));
  const port = 54331;
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
      throw new Error('registration test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('stores an unverified account and sends one proof to that email', async () => {
    const response = await post(baseUrl, {
      username: 'sam',
      email: 'sam@example.com',
      password: 'secret-phrase',
      nickname: '',
      timezone: 'America/New_York',
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: 'ok' });
    expect(JSON.stringify(response.body)).not.toContain(mail.messages[0]?.code ?? 'missing-code');

    const account = await pool.query<{
      username: string;
      nickname: string | null;
      verified_at: string | null;
      password_hash: string;
    }>('SELECT username, nickname, verified_at, password_hash FROM accounts WHERE username = $1', [
      'sam',
    ]);
    const row = account.rows[0];
    expect(row?.nickname).toBeNull();
    expect(row?.verified_at).toBeNull();
    expect(displayName({ username: row?.username ?? '', nickname: row?.nickname ?? null })).toBe(
      'sam',
    );
    expect(row?.password_hash).not.toBe('secret-phrase');
    expect(await passwordMatches('secret-phrase', row?.password_hash ?? '')).toBe(true);

    const proofs = await pool.query<{ purpose: string; code_hash: string; used_at: string | null }>(
      `SELECT purpose, code_hash, used_at FROM proofs
       WHERE account_id = (SELECT id FROM accounts WHERE username = 'sam')`,
    );
    expect(proofs.rows).toHaveLength(1);
    expect(proofs.rows[0]?.purpose).toBe('verification');
    expect(proofs.rows[0]?.used_at).toBeNull();
    expect(mail.messages).toEqual([{ to: 'sam@example.com', code: mail.messages[0]?.code }]);
    expect(proofCodeMatches(mail.messages[0]?.code ?? '', proofs.rows[0]?.code_hash ?? '')).toBe(
      true,
    );
  });

  it('returns the same rejection for a taken username, either email, and a retired username', async () => {
    await pool.query(
      `UPDATE accounts SET verified_at = now()
       WHERE email = 'verified@example.com'`,
    );
    await pool.query(
      `INSERT INTO accounts (id, username, email, password_hash, timezone, verified_at)
       VALUES (gen_random_uuid(), 'verified-user', 'verified@example.com', 'hash', 'UTC', now())`,
    );
    await pool.query(
      `INSERT INTO accounts (id, username, email, password_hash, timezone)
       VALUES (gen_random_uuid(), 'pending-user', 'pending@example.com', 'hash', 'UTC')`,
    );
    await pool.query(
      `INSERT INTO retired_usernames (username, retired_at) VALUES ('retired-name', now())`,
    );
    const before = await accountCount(pool);
    const bodies = await Promise.all([
      post(baseUrl, registration('sam', 'fresh-one@example.com')),
      post(baseUrl, registration('fresh-two', 'pending@example.com')),
      post(baseUrl, registration('fresh-three', 'verified@example.com')),
      post(baseUrl, registration('retired-name', 'fresh-four@example.com')),
    ]);
    expect(bodies.map((body) => body.status)).toEqual([400, 400, 400, 400]);
    expect(new Set(bodies.map((body) => JSON.stringify(body.body))).size).toBe(1);
    expect(bodies[0]?.body).toEqual({ result: 'registration_rejected' });
    expect(JSON.stringify(bodies[0]?.body)).not.toContain('taken');
    expect(await accountCount(pool)).toBe(before);
  });

  it('returns send_failed for a new registration and a taken username when mail cannot send', async () => {
    const before = await pool.query(
      'SELECT id, username, email, password_hash FROM accounts ORDER BY username',
    );
    mail.able = false;
    mail.messages = [];
    const created = await post(baseUrl, registration('brand-new', 'brand-new@example.com'));
    const taken = await post(baseUrl, registration('sam', 'another@example.com'));
    mail.able = true;
    expect(created).toEqual({ status: 503, body: { result: 'send_failed' } });
    expect(taken).toEqual({ status: 503, body: { result: 'send_failed' } });
    expect(mail.messages).toEqual([]);
    const after = await pool.query(
      'SELECT id, username, email, password_hash FROM accounts ORDER BY username',
    );
    expect(after.rows).toEqual(before.rows);
  });

  it('keeps an internal space in a nickname and stores a blank nickname as null', async () => {
    const named = await post(baseUrl, {
      ...registration('spaced-user', 'spaced@example.com'),
      nickname: '  Sam Lee  ',
    });
    const blank = await post(baseUrl, {
      ...registration('blank-user', 'blank@example.com'),
      nickname: '   ',
    });
    expect(named.body).toEqual({ result: 'ok' });
    expect(blank.body).toEqual({ result: 'ok' });
    const rows = await pool.query<{ username: string; nickname: string | null }>(
      `SELECT username, nickname FROM accounts
       WHERE username IN ('spaced-user', 'blank-user')
       ORDER BY username`,
    );
    expect(rows.rows).toEqual([
      { username: 'blank-user', nickname: null },
      { username: 'spaced-user', nickname: 'Sam Lee' },
    ]);
  });

  it('rejects an unresolved timezone and writes nothing', async () => {
    const before = await accountCount(pool);
    const response = await post(
      baseUrl,
      registration('zone-user', 'zone@example.com', 'Not/AZone'),
    );
    expect(response).toEqual({ status: 400, body: { result: 'save_rejected' } });
    expect(await accountCount(pool)).toBe(before);
  });
});

class RecordingMail implements MailPort {
  messages: ProofMessage[] = [];
  able = true;

  canSend(): Promise<boolean> {
    return Promise.resolve(this.able);
  }

  sendProof(message: ProofMessage): Promise<'accepted' | 'rejected'> {
    if (!this.able) {
      return Promise.resolve('rejected');
    }
    this.messages.push(message);
    return Promise.resolve('accepted');
  }
}

function registration(username: string, email: string, timezone = 'America/New_York') {
  return { username, email, password: 'secret-phrase', timezone };
}

async function post(
  baseUrl: string,
  body: unknown,
): Promise<{ status: number; body: { result: string } }> {
  const response = await fetch(`${baseUrl}/api/registrations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function accountCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM accounts',
  );
  return Number(result.rows[0]?.count ?? 0);
}
