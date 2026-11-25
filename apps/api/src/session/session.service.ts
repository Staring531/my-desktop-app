import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';
import { formatOperationLog } from '../results/log';
import { httpStatus, resultBody, type ResultBody, type ResultName } from '../results/results';
import { createProofCode, passwordMatches, proofCodeMatches } from '../results/secrets';
import { readPresentedSession, serializeSessionCookie } from './cookie';
import { SECURE_SESSION_COOKIE } from './session-token';

export type OpenSession = { sessionId: string; accountId: string };

@Injectable()
export class SessionService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(SECURE_SESSION_COOKIE) private readonly secureCookie: boolean,
  ) {}

  async login(body: unknown): Promise<{ status: number; body: ResultBody; cookie?: string }> {
    const input = parseLogin(body);
    const client = await this.pool.connect();
    try {
      const result: LoginResult = input === undefined ? rejected() : await openLogin(client, input);
      console.info(
        formatOperationLog({
          operation: 'login',
          result: result.result,
          ...(result.accountId === undefined ? {} : { accountId: result.accountId }),
        }),
      );
      return {
        status: httpStatus[result.result],
        body: resultBody(result.result),
        ...(result.cookie === undefined
          ? {}
          : { cookie: serializeSessionCookie(result.cookie, this.secureCookie) }),
      };
    } finally {
      client.release();
    }
  }

  async logout(cookieHeader: string | undefined): Promise<{ status: number; body: ResultBody }> {
    const client = await this.pool.connect();
    try {
      const result = await endPresentedSession(client, cookieHeader);
      console.info(
        formatOperationLog({
          operation: 'logout',
          result: result.result,
          ...(result.accountId === undefined ? {} : { accountId: result.accountId }),
        }),
      );
      return { status: httpStatus[result.result], body: resultBody(result.result) };
    } finally {
      client.release();
    }
  }
}

export async function endPresentedSession(
  client: PoolClient,
  cookieHeader: string | undefined,
): Promise<{ result: ResultName; accountId?: string }> {
  const presented = readPresentedSession(cookieHeader);
  if (presented === undefined) {
    return { result: 'logged_out' };
  }
  try {
    await client.query('BEGIN');
    const open = await lockOpenSession(client, presented.sessionId, presented.secret);
    if (open === undefined) {
      await client.query('ROLLBACK');
      return { result: 'logged_out' };
    }
    await client.query('UPDATE sessions SET ended_at = now() WHERE id = $1', [open.sessionId]);
    await client.query('COMMIT');
    return { result: 'ok', accountId: open.accountId };
  } catch {
    await rollbackQuietly(client);
    return { result: 'operation_failed' };
  }
}

type LoginResult = { result: ResultName; cookie?: string; accountId?: string };

async function openLogin(
  client: PoolClient,
  input: { email: string; password: string },
): Promise<LoginResult> {
  try {
    await client.query('BEGIN');
    const found = await client.query<{
      id: string;
      password_hash: string;
      verified_at: Date | null;
    }>('SELECT id, password_hash, verified_at FROM accounts WHERE email = $1', [input.email]);
    const account = found.rows[0];
    if (
      account === undefined ||
      account.verified_at === null ||
      !(await passwordMatches(input.password, account.password_hash))
    ) {
      await client.query('ROLLBACK');
      return rejected();
    }
    const sessionId = randomUUID();
    const secret = createProofCode();
    await client.query('INSERT INTO sessions (id, account_id, secret_hash) VALUES ($1, $2, $3)', [
      sessionId,
      account.id,
      secret.codeHash,
    ]);
    await client.query('COMMIT');
    return {
      result: 'ok',
      accountId: account.id,
      cookie: `${sessionId}.${secret.code}`,
    };
  } catch {
    await rollbackQuietly(client);
    return { result: 'operation_failed' };
  }
}

export async function lockOpenSession(
  client: PoolClient,
  sessionId: string,
  secret: string,
): Promise<OpenSession | undefined> {
  const found = await client.query<{
    account_id: string;
    secret_hash: string;
    ended_at: Date | null;
  }>('SELECT account_id, secret_hash, ended_at FROM sessions WHERE id = $1 FOR UPDATE', [
    sessionId,
  ]);
  const session = found.rows[0];
  if (
    session === undefined ||
    session.ended_at !== null ||
    !proofCodeMatches(secret, session.secret_hash)
  ) {
    return undefined;
  }
  return { sessionId, accountId: session.account_id };
}

function parseLogin(body: unknown): { email: string; password: string } | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.email !== 'string' || typeof record.password !== 'string') {
    return undefined;
  }
  if (record.email === '' || record.password === '') {
    return undefined;
  }
  return { email: record.email, password: record.password };
}

function rejected(): LoginResult {
  return { result: 'login_rejected' };
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
