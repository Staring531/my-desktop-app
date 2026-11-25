import 'reflect-metadata';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { Pool } from 'pg';
import { createApplication } from '../app.module';
import { applyMigrations, createPersonalTimePool, migrationsDirectory } from '../db/connection';
import type { MailPort, ProofMessage } from '../mail/protocol';
import { createProofCode } from '../results/secrets';

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

describe('POST /api/registrations/verify', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-verify-'));
  const port = 54332;
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
      throw new Error('verification test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('verifies a matching proof and creates one personal calendar', async () => {
    const code = await register(baseUrl, mail, 'vera', 'vera@example.com');
    const response = await post(baseUrl, '/api/registrations/verify', { code });
    expect(response).toEqual({ status: 200, body: { result: 'ok' } });
    const account = await pool.query<{ verified_at: Date | null; calendars: number }>(
      `SELECT accounts.verified_at, count(calendars.id)::int AS calendars
       FROM accounts
       LEFT JOIN calendars ON calendars.owner_account_id = accounts.id
       WHERE accounts.username = 'vera'
       GROUP BY accounts.verified_at`,
    );
    expect(account.rows[0]?.verified_at).not.toBeNull();
    expect(account.rows[0]?.calendars).toBe(1);
    const calendar = await pool.query<{ kind: string }>(
      `SELECT kind FROM calendars
       WHERE owner_account_id = (SELECT id FROM accounts WHERE username = 'vera')`,
    );
    expect(calendar.rows).toEqual([{ kind: 'personal' }]);
    const proof = await pool.query<{ used_at: Date | null }>(
      `SELECT used_at FROM proofs
       WHERE purpose = 'verification'
         AND account_id = (SELECT id FROM accounts WHERE username = 'vera')`,
    );
    expect(proof.rows[0]?.used_at).not.toBeNull();
  });

  it('returns the same rejection for a wrong code and a second use', async () => {
    const wrongCode = await register(baseUrl, mail, 'wrong', 'wrong@example.com');
    const wrong = await post(baseUrl, '/api/registrations/verify', { code: `${wrongCode}x` });
    const wrongAccount = await pool.query<{ verified_at: Date | null }>(
      'SELECT verified_at FROM accounts WHERE username = $1',
      ['wrong'],
    );
    expect(wrongAccount.rows[0]?.verified_at).toBeNull();

    const reused = await register(baseUrl, mail, 'reuse', 'reuse@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code: reused })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const second = await post(baseUrl, '/api/registrations/verify', { code: reused });
    expect(second).toEqual(wrong);
    expect(second.body).toEqual({ result: 'verification_rejected' });
    expect(JSON.stringify(second.body)).not.toContain(reused);
    expect(JSON.stringify(second.body)).not.toContain('reuse@example.com');
    const calendars = await pool.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM calendars
       WHERE owner_account_id = (SELECT id FROM accounts WHERE username = 'reuse')`,
    );
    expect(calendars.rows[0]?.count).toBe(1);
  });

  it('does not verify an account with a recovery proof', async () => {
    await register(baseUrl, mail, 'recover', 'recover@example.com');
    const proof = createProofCode();
    await pool.query(
      `INSERT INTO proofs (id, account_id, purpose, code_hash)
       VALUES ($1, (SELECT id FROM accounts WHERE username = 'recover'), 'recovery', $2)`,
      [randomUUID(), proof.codeHash],
    );
    const response = await post(baseUrl, '/api/registrations/verify', { code: proof.code });
    expect(response).toEqual({ status: 400, body: { result: 'verification_rejected' } });
    expect(JSON.stringify(response.body)).not.toContain(proof.code);
    expect(JSON.stringify(response.body)).not.toContain('recover@example.com');
    const account = await pool.query<{ verified_at: Date | null; calendars: number }>(
      `SELECT accounts.verified_at, count(calendars.id)::int AS calendars
       FROM accounts
       LEFT JOIN calendars ON calendars.owner_account_id = accounts.id
       WHERE accounts.username = 'recover'
       GROUP BY accounts.verified_at`,
    );
    expect(account.rows[0]?.verified_at).toBeNull();
    expect(account.rows[0]?.calendars).toBe(0);
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

async function register(
  baseUrl: string,
  mail: RecordingMail,
  username: string,
  email: string,
): Promise<string> {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/registrations', {
    username,
    email,
    password: 'secret-phrase',
    timezone: 'America/New_York',
  });
  expect(response).toEqual({ status: 200, body: { result: 'ok' } });
  const message = mail.messages[before];
  expect(message?.to).toBe(email);
  return message?.code ?? '';
}

async function post(
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<{ status: number; body: { result: string } }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}
