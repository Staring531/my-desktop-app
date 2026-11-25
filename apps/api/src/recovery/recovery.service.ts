import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';
import { MAIL_PORT } from '../mail/mail-token';
import {
  runProofSend,
  type MailPort,
  type PreparedSend,
  type ProofSendOutcome,
} from '../mail/protocol';
import { formatOperationLog } from '../results/log';
import { httpStatus, resultBody, type ResultName } from '../results/results';
import { createProofCode, hashPassword, proofCodeMatches } from '../results/secrets';

@Injectable()
export class RecoveryService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(MAIL_PORT) private readonly mail: MailPort,
  ) {}

  async start(body: unknown): Promise<ProofSendOutcome> {
    const email = parseEmail(body);
    const client = await this.pool.connect();
    try {
      return await runProofSend({
        client,
        port: this.mail,
        operation: 'start-recovery',
        successResult: 'login_rejected',
        prepare: (db) => prepareRecovery(db, email),
      });
    } finally {
      client.release();
    }
  }

  async complete(body: unknown): Promise<{ status: number; body: { result: ResultName } }> {
    const input = parseCompletion(body);
    const client = await this.pool.connect();
    try {
      const result =
        input === undefined ? 'recovery_rejected' : await completeRecovery(client, input);
      console.info(formatOperationLog({ operation: 'complete-recovery', result }));
      return { status: httpStatus[result], body: resultBody(result) };
    } finally {
      client.release();
    }
  }
}

export async function startRecovery(
  client: PoolClient,
  port: MailPort,
  email: string,
  afterLock?: () => Promise<void>,
): Promise<ResultName> {
  const outcome = await runProofSend({
    client,
    port,
    operation: 'start-recovery',
    successResult: 'login_rejected',
    prepare: async (db) => {
      const prepared = await prepareRecovery(db, email);
      if (prepared.action === 'send' && afterLock !== undefined) {
        await afterLock();
      }
      return prepared;
    },
  });
  return outcome.body.result;
}

async function prepareRecovery(
  client: PoolClient,
  email: string | undefined,
): Promise<PreparedSend> {
  if (email === undefined) {
    return { action: 'result', result: 'login_rejected' };
  }
  const found = await client.query<{ id: string; verified_at: Date | null }>(
    'SELECT id, verified_at FROM accounts WHERE email = $1 FOR UPDATE',
    [email],
  );
  const account = found.rows[0];
  if (account === undefined || account.verified_at === null) {
    return { action: 'result', result: 'login_rejected' };
  }
  await client.query(
    `UPDATE proofs
     SET superseded_at = now()
     WHERE account_id = $1
       AND purpose = 'recovery'
       AND used_at IS NULL
       AND superseded_at IS NULL`,
    [account.id],
  );
  const proof = createProofCode();
  await client.query(
    `INSERT INTO proofs (id, account_id, purpose, code_hash)
     VALUES ($1, $2, 'recovery', $3)`,
    [randomUUID(), account.id, proof.codeHash],
  );
  return { action: 'send', message: { to: email, code: proof.code } };
}

export async function completeRecovery(
  client: PoolClient,
  input: { email: string; password: string; proof: string },
  afterLock?: () => Promise<void>,
): Promise<ResultName> {
  try {
    await client.query('BEGIN');
    const found = await client.query<{ id: string; verified_at: Date | null }>(
      'SELECT id, verified_at FROM accounts WHERE email = $1 FOR UPDATE',
      [input.email],
    );
    const account = found.rows[0];
    if (account === undefined || account.verified_at === null) {
      await client.query('ROLLBACK');
      return 'recovery_rejected';
    }
    if (afterLock !== undefined) {
      await afterLock();
    }
    const proofs = await client.query<{ id: string; code_hash: string }>(
      `SELECT id, code_hash
       FROM proofs
       WHERE account_id = $1
         AND purpose = 'recovery'
         AND used_at IS NULL
         AND superseded_at IS NULL`,
      [account.id],
    );
    const match = proofs.rows.find((row) => proofCodeMatches(input.proof, row.code_hash));
    if (match === undefined) {
      await client.query('ROLLBACK');
      return 'recovery_rejected';
    }
    const stillUnused = await client.query(
      `SELECT id FROM proofs
       WHERE id = $1
         AND purpose = 'recovery'
         AND used_at IS NULL
         AND superseded_at IS NULL
       FOR UPDATE`,
      [match.id],
    );
    if ((stillUnused.rowCount ?? 0) === 0) {
      await client.query('ROLLBACK');
      return 'recovery_rejected';
    }
    await client.query('UPDATE accounts SET password_hash = $2 WHERE id = $1', [
      account.id,
      await hashPassword(input.password),
    ]);
    await client.query('UPDATE proofs SET used_at = now() WHERE id = $1', [match.id]);
    await client.query(
      'UPDATE sessions SET ended_at = now() WHERE account_id = $1 AND ended_at IS NULL',
      [account.id],
    );
    await client.query('COMMIT');
    return 'ok';
  } catch {
    await rollbackQuietly(client);
    return 'operation_failed';
  }
}

function parseEmail(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const email = (body as Record<string, unknown>).email;
  return typeof email === 'string' && email !== '' ? email : undefined;
}

function parseCompletion(
  body: unknown,
): { email: string; password: string; proof: string } | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  if (
    typeof record.email !== 'string' ||
    typeof record.password !== 'string' ||
    typeof record.proof !== 'string' ||
    record.email === '' ||
    record.proof === ''
  ) {
    return undefined;
  }
  return { email: record.email, password: record.password, proof: record.proof };
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
