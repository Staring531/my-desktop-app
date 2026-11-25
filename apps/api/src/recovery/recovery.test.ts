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

describe('POST /api/recoveries', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-recovery-'));
  const port = 54335;
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
  let memberId = '';
  let verificationCode = '';

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
      throw new Error('recovery test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('returns one login failure while mail can send and stores a proof only for the verified account', async () => {
    await register(baseUrl, mail, 'pending', 'pending@example.com');
    verificationCode = await register(baseUrl, mail, 'member', 'member@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code: verificationCode })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    memberId = await accountId(pool, 'member@example.com');
    const before = mail.messages.length;
    const verified = await post(baseUrl, '/api/recoveries', { email: 'member@example.com' });
    const unknown = await post(baseUrl, '/api/recoveries', { email: 'missing@example.com' });
    const unverified = await post(baseUrl, '/api/recoveries', { email: 'pending@example.com' });
    expect(verified).toEqual(unknown);
    expect(unknown).toEqual(unverified);
    expect(unverified).toEqual({ status: 400, body: { result: 'login_rejected' } });
    expect(JSON.stringify(unverified.body)).not.toContain('member@example.com');
    const sent = mail.messages.slice(before);
    expect(sent.map((message) => message.to)).toEqual(['member@example.com']);
    expect(await recoveryProofs(pool, memberId)).toEqual([{ superseded_at: null, used_at: null }]);
    expect(await recoveryProofs(pool, await accountId(pool, 'pending@example.com'))).toEqual([]);
  });

  it('replaces the unused recovery proof with the newest one', async () => {
    const before = mail.messages.length;
    const again = await post(baseUrl, '/api/recoveries', { email: 'member@example.com' });
    expect(again).toEqual({ status: 400, body: { result: 'login_rejected' } });
    const proofs = await recoveryProofs(pool, memberId);
    expect(
      proofs.filter((proof) => proof.superseded_at === null && proof.used_at === null),
    ).toHaveLength(1);
    expect(proofs.filter((proof) => proof.superseded_at !== null)).toHaveLength(1);
    expect(mail.messages.slice(before).map((message) => message.to)).toEqual([
      'member@example.com',
    ]);
  });

  it('stores nothing and returns send_failed for every start while mail cannot send', async () => {
    const proofsBefore = await recoveryProofs(pool, memberId);
    const messagesBefore = mail.messages.length;
    mail.able = false;
    const verified = await post(baseUrl, '/api/recoveries', { email: 'member@example.com' });
    const unknown = await post(baseUrl, '/api/recoveries', { email: 'missing@example.com' });
    const unverified = await post(baseUrl, '/api/recoveries', { email: 'pending@example.com' });
    mail.able = true;
    expect(verified).toEqual(unknown);
    expect(unknown).toEqual(unverified);
    expect(unverified).toEqual({ status: 503, body: { result: 'send_failed' } });
    expect(await recoveryProofs(pool, memberId)).toEqual(proofsBefore);
    expect(mail.messages).toHaveLength(messagesBefore);
  });

  it('rejects an earlier proof, a mismatch, another purpose, an unknown email, and an unverified registration', async () => {
    const hashBefore = await passwordHash(pool, memberId);
    const session = await login(baseUrl, 'member@example.com', 'secret-phrase');
    const earlier = mail.messages.at(-2)?.code ?? '';
    const otherPurpose = createProofCode();
    await pool.query(
      `INSERT INTO proofs (id, account_id, purpose, code_hash) VALUES ($1, $2, 'verification', $3)`,
      [randomUUID(), memberId, otherPurpose.codeHash],
    );
    const cases = [
      { email: 'member@example.com', password: 'next-phrase', proof: earlier },
      { email: 'member@example.com', password: 'next-phrase', proof: 'not-the-proof' },
      { email: 'member@example.com', password: 'next-phrase', proof: otherPurpose.code },
      { email: 'missing@example.com', password: 'next-phrase', proof: earlier },
      { email: 'pending@example.com', password: 'next-phrase', proof: verificationCode },
    ];
    const bodies = [];
    for (const body of cases) {
      bodies.push(await post(baseUrl, '/api/recoveries/complete', body));
    }
    expect(new Set(bodies.map((item) => JSON.stringify(item))).size).toBe(1);
    expect(bodies[0]).toEqual({ status: 400, body: { result: 'recovery_rejected' } });
    expect(JSON.stringify(bodies[0]?.body)).not.toContain('member@example.com');
    expect(JSON.stringify(bodies[0]?.body)).not.toContain('next-phrase');
    expect(await passwordHash(pool, memberId)).toBe(hashBefore);
    expect(await endedAt(pool, session)).toBeNull();
  });

  it('replaces the password, ends every open session, and leaves the next login to the new password', async () => {
    const first = await login(baseUrl, 'member@example.com', 'secret-phrase');
    const second = await login(baseUrl, 'member@example.com', 'secret-phrase');
    const newest = mail.messages.at(-1)?.code ?? '';
    const response = await fetch(`${baseUrl}/api/recoveries/complete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'member@example.com',
        password: 'next-phrase',
        proof: newest,
      }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ result: 'ok' });
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(await endedAt(pool, first)).not.toBeNull();
    expect(await endedAt(pool, second)).not.toBeNull();
    expect(await calendarCount(pool, memberId)).toBe(1);
    const reused = await post(baseUrl, '/api/recoveries/complete', {
      email: 'member@example.com',
      password: 'another-phrase',
      proof: newest,
    });
    expect(reused).toEqual({ status: 400, body: { result: 'recovery_rejected' } });
    const oldPassword = await post(baseUrl, '/api/sessions', {
      email: 'member@example.com',
      password: 'secret-phrase',
    });
    expect(oldPassword).toEqual({ status: 400, body: { result: 'login_rejected' } });
    const opened = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'member@example.com', password: 'next-phrase' }),
    });
    expect(opened.status).toBe(200);
    expect(await opened.json()).toEqual({ result: 'ok' });
    expect(opened.headers.getSetCookie()[0]).toContain('session=');
    expect(await calendarCount(pool, memberId)).toBe(1);
  });
});

class RecordingMail implements MailPort {
  messages: ProofMessage[] = [];
  able = true;

  canSend(): Promise<boolean> {
    return Promise.resolve(this.able);
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

async function login(baseUrl: string, email: string, password: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  expect(response.status).toBe(200);
  const pair = response.headers.getSetCookie()[0]?.split(';')[0] ?? '';
  const raw = decodeURIComponent(pair.slice('session='.length));
  return raw.slice(0, raw.indexOf('.'));
}

async function accountId(pool: Pool, email: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM accounts WHERE email = $1', [
    email,
  ]);
  return result.rows[0]?.id ?? '';
}

async function recoveryProofs(
  pool: Pool,
  accountIdValue: string,
): Promise<Array<{ superseded_at: Date | null; used_at: Date | null }>> {
  const result = await pool.query<{ superseded_at: Date | null; used_at: Date | null }>(
    `SELECT superseded_at, used_at
     FROM proofs
     WHERE account_id = $1 AND purpose = 'recovery'
     ORDER BY superseded_at NULLS LAST`,
    [accountIdValue],
  );
  return result.rows;
}

async function passwordHash(pool: Pool, accountIdValue: string): Promise<string> {
  const result = await pool.query<{ password_hash: string }>(
    'SELECT password_hash FROM accounts WHERE id = $1',
    [accountIdValue],
  );
  return result.rows[0]?.password_hash ?? '';
}

async function endedAt(pool: Pool, sessionId: string): Promise<Date | null | undefined> {
  const result = await pool.query<{ ended_at: Date | null }>(
    'SELECT ended_at FROM sessions WHERE id = $1',
    [sessionId],
  );
  return result.rows[0]?.ended_at;
}

async function calendarCount(pool: Pool, accountIdValue: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM calendars WHERE owner_account_id = $1',
    [accountIdValue],
  );
  return Number(result.rows[0]?.count ?? 0);
}
