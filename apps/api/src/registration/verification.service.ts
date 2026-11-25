import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';
import { formatOperationLog } from '../results/log';
import { httpStatus, resultBody, type ResultName } from '../results/results';
import { proofCodeMatches } from '../results/secrets';

@Injectable()
export class VerificationService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async verify(body: unknown): Promise<{ status: number; body: { result: ResultName } }> {
    const code = parseProofCode(body);
    const client = await this.pool.connect();
    try {
      const result = code === undefined ? 'verification_rejected' : await verifyProof(client, code);
      console.info(formatOperationLog({ operation: 'verify', result }));
      return { status: httpStatus[result], body: resultBody(result) };
    } finally {
      client.release();
    }
  }
}

export async function verifyProof(
  client: PoolClient,
  code: string,
  afterLock?: () => Promise<void>,
): Promise<ResultName> {
  try {
    await client.query('BEGIN');
    const proofs = await client.query<{ id: string; account_id: string; code_hash: string }>(
      `SELECT id, account_id, code_hash
       FROM proofs
       WHERE purpose = 'verification' AND used_at IS NULL AND superseded_at IS NULL`,
    );
    const match = proofs.rows.find((row) => proofCodeMatches(code, row.code_hash));
    if (match === undefined) {
      await client.query('ROLLBACK');
      return 'verification_rejected';
    }
    await client.query('SELECT id FROM accounts WHERE id = $1 FOR UPDATE', [match.account_id]);
    const current = await client.query<{ verified_at: Date | null }>(
      'SELECT verified_at FROM accounts WHERE id = $1',
      [match.account_id],
    );
    const stillUnused = await client.query(
      `SELECT id FROM proofs
       WHERE id = $1 AND purpose = 'verification' AND used_at IS NULL AND superseded_at IS NULL
       FOR UPDATE`,
      [match.id],
    );
    if (
      (current.rowCount ?? 0) === 0 ||
      current.rows[0]?.verified_at ||
      (stillUnused.rowCount ?? 0) === 0
    ) {
      await client.query('ROLLBACK');
      return 'verification_rejected';
    }
    if (afterLock !== undefined) {
      await afterLock();
    }
    await client.query('UPDATE accounts SET verified_at = now() WHERE id = $1', [match.account_id]);
    await client.query('UPDATE proofs SET used_at = now() WHERE id = $1', [match.id]);
    await client.query(
      `INSERT INTO calendars (id, owner_account_id, kind) VALUES ($1, $2, 'personal')`,
      [randomUUID(), match.account_id],
    );
    await client.query('COMMIT');
    return 'ok';
  } catch {
    await rollbackQuietly(client);
    return 'operation_failed';
  }
}

function parseProofCode(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const code = (body as Record<string, unknown>).code;
  return typeof code === 'string' && code !== '' ? code : undefined;
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
