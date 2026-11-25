import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';
import { storedNickname } from '../identity/display-name';
import { MAIL_PORT } from '../mail/mail-token';
import {
  runProofSend,
  type MailPort,
  type PreparedSend,
  type ProofSendOutcome,
} from '../mail/protocol';
import { createProofCode, hashPassword } from '../results/secrets';
import { resolveTimeZone } from '../time/civil-time';

export type RegistrationInput = {
  username: string;
  email: string;
  password: string;
  timezone: string;
  nickname?: string;
};

@Injectable()
export class RegistrationService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(MAIL_PORT) private readonly mail: MailPort,
  ) {}

  async register(body: unknown): Promise<ProofSendOutcome> {
    const input = parseRegistration(body);
    if (input === undefined) {
      return { status: 400, body: { result: 'save_rejected' } };
    }
    const client = await this.pool.connect();
    try {
      return await runProofSend({
        client,
        port: this.mail,
        operation: 'register',
        prepare: (db) => prepareRegistration(db, input),
      });
    } finally {
      client.release();
    }
  }
}

async function prepareRegistration(
  client: PoolClient,
  input: RegistrationInput,
): Promise<PreparedSend> {
  if (!resolveTimeZone(input.timezone)) {
    return { action: 'result', result: 'save_rejected' };
  }
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))', [
    input.username,
  ]);
  const retired = await client.query('SELECT 1 FROM retired_usernames WHERE username = $1', [
    input.username,
  ]);
  if ((retired.rowCount ?? 0) > 0) {
    return { action: 'result', result: 'registration_rejected' };
  }
  const existing = await client.query('SELECT 1 FROM accounts WHERE username = $1 OR email = $2', [
    input.username,
    input.email,
  ]);
  if ((existing.rowCount ?? 0) > 0) {
    return { action: 'result', result: 'registration_rejected' };
  }
  const accountId = randomUUID();
  const proof = createProofCode();
  try {
    await client.query(
      `INSERT INTO accounts (id, username, email, password_hash, nickname, timezone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        accountId,
        input.username,
        input.email,
        await hashPassword(input.password),
        storedNickname(input.nickname),
        input.timezone,
      ],
    );
    await client.query(
      `INSERT INTO proofs (id, account_id, purpose, code_hash)
       VALUES ($1, $2, 'verification', $3)`,
      [randomUUID(), accountId, proof.codeHash],
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { action: 'result', result: 'registration_rejected' };
    }
    throw error;
  }
  return { action: 'send', message: { to: input.email, code: proof.code } };
}

function parseRegistration(body: unknown): RegistrationInput | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  if (
    typeof record.username !== 'string' ||
    typeof record.email !== 'string' ||
    typeof record.password !== 'string' ||
    typeof record.timezone !== 'string'
  ) {
    return undefined;
  }
  if (record.nickname !== undefined && typeof record.nickname !== 'string') {
    return undefined;
  }
  return {
    username: record.username,
    email: record.email,
    password: record.password,
    timezone: record.timezone,
    ...(typeof record.nickname === 'string' ? { nickname: record.nickname } : {}),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}
