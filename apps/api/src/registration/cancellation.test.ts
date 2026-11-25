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
import { cancelRegistration } from './cancellation.service';
import { verifyProof } from './verification.service';

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

describe('POST /api/registrations/cancel', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-cancel-'));
  const port = 54333;
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
      throw new Error('cancellation test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('removes an unverified registration and allows that username and email again', async () => {
    await register(baseUrl, mail, 'gone', 'gone@example.com');
    const account = await pool.query<{ id: string }>(
      'SELECT id FROM accounts WHERE username = $1',
      ['gone'],
    );
    const accountId = account.rows[0]?.id;
    const response = await post(baseUrl, '/api/registrations/cancel', {
      email: 'gone@example.com',
      password: 'secret-phrase',
    });
    expect(response).toEqual({ status: 200, body: { result: 'ok' } });
    expect(await accountCount(pool, 'gone')).toBe(0);
    const proofs = await pool.query('SELECT 1 FROM proofs WHERE account_id = $1', [accountId]);
    expect(proofs.rowCount).toBe(0);
    const retired = await pool.query('SELECT 1 FROM retired_usernames WHERE username = $1', [
      'gone',
    ]);
    expect(retired.rowCount).toBe(0);
    const again = await post(baseUrl, '/api/registrations', {
      username: 'gone',
      email: 'gone@example.com',
      password: 'secret-phrase',
      timezone: 'America/New_York',
    });
    expect(again).toEqual({ status: 200, body: { result: 'ok' } });
  });

  it('uses one rejection for an unknown email, a wrong password, and a verified account', async () => {
    await register(baseUrl, mail, 'pending', 'pending@example.com');
    const code = await register(baseUrl, mail, 'verified', 'verified@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const before = await pool.query(
      'SELECT username, email, verified_at IS NOT NULL AS verified FROM accounts ORDER BY username',
    );
    const unknown = await post(baseUrl, '/api/registrations/cancel', {
      email: 'missing@example.com',
      password: 'secret-phrase',
    });
    const wrong = await post(baseUrl, '/api/registrations/cancel', {
      email: 'pending@example.com',
      password: 'wrong-phrase',
    });
    const verified = await post(baseUrl, '/api/registrations/cancel', {
      email: 'verified@example.com',
      password: 'secret-phrase',
    });
    expect(unknown).toEqual(wrong);
    expect(wrong).toEqual(verified);
    expect(verified).toEqual({ status: 400, body: { result: 'cancellation_rejected' } });
    expect(JSON.stringify(verified.body)).not.toContain('pending@example.com');
    expect(JSON.stringify(verified.body)).not.toContain('secret-phrase');
    const after = await pool.query(
      'SELECT username, email, verified_at IS NOT NULL AS verified FROM accounts ORDER BY username',
    );
    expect(after.rows).toEqual(before.rows);
    const calendars = await pool.query(
      `SELECT count(*)::int AS count FROM calendars
       WHERE owner_account_id = (SELECT id FROM accounts WHERE username = 'verified')`,
    );
    expect(calendars.rows[0]?.count).toBe(1);
  });

  it('lets a cancellation that commits first leave verification with no account', async () => {
    const code = await register(baseUrl, mail, 'cancel-first', 'cancel-first@example.com');
    const outcome = await finishOrder(pool, {
      email: 'cancel-first@example.com',
      password: 'secret-phrase',
      code,
      leader: 'cancel',
    });
    expect(outcome).toEqual({ leader: 'ok', follower: 'verification_rejected' });
    expect(await accountCount(pool, 'cancel-first')).toBe(0);
  });

  it('lets a verification that commits first keep the verified account and its calendar', async () => {
    const code = await register(baseUrl, mail, 'verify-first', 'verify-first@example.com');
    const outcome = await finishOrder(pool, {
      email: 'verify-first@example.com',
      password: 'secret-phrase',
      code,
      leader: 'verify',
    });
    expect(outcome).toEqual({ leader: 'ok', follower: 'cancellation_rejected' });
    const account = await pool.query<{ verified: boolean; calendars: number }>(
      `SELECT accounts.verified_at IS NOT NULL AS verified, count(calendars.id)::int AS calendars
       FROM accounts
       LEFT JOIN calendars ON calendars.owner_account_id = accounts.id
       WHERE accounts.username = 'verify-first'
       GROUP BY accounts.verified_at`,
    );
    expect(account.rows[0]).toEqual({ verified: true, calendars: 1 });
  });
});

async function finishOrder(
  pool: Pool,
  input: { email: string; password: string; code: string; leader: 'cancel' | 'verify' },
): Promise<{ leader: string; follower: string }> {
  const leader = await pool.connect();
  const follower = await pool.connect();
  const release = deferred<void>();
  const entered = deferred<void>();
  try {
    const leaderResult =
      input.leader === 'cancel'
        ? cancelRegistration(leader, input.email, input.password, async () => {
            entered.resolve();
            await release.promise;
          })
        : verifyProof(leader, input.code, async () => {
            entered.resolve();
            await release.promise;
          });
    await entered.promise;
    const followerResult =
      input.leader === 'cancel'
        ? verifyProof(follower, input.code)
        : cancelRegistration(follower, input.email, input.password);
    await waitForRowLock(pool);
    release.resolve();
    return { leader: await leaderResult, follower: await followerResult };
  } finally {
    leader.release();
    follower.release();
  }
}

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

async function accountCount(pool: Pool, username: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM accounts WHERE username = $1',
    [username],
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
  throw new Error('the later operation did not wait on the account row');
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
