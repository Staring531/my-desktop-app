import { Inject, Injectable } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';
import { formatOperationLog } from '../results/log';
import { httpStatus, resultBody, type ResultName } from '../results/results';
import { passwordMatches } from '../results/secrets';

@Injectable()
export class CancellationService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async cancel(body: unknown): Promise<{ status: number; body: { result: ResultName } }> {
    const input = parseCancellation(body);
    const client = await this.pool.connect();
    try {
      const result =
        input === undefined
          ? 'cancellation_rejected'
          : await cancelRegistration(client, input.email, input.password);
      console.info(formatOperationLog({ operation: 'cancel-registration', result }));
      return { status: httpStatus[result], body: resultBody(result) };
    } finally {
      client.release();
    }
  }
}

export async function cancelRegistration(
  client: PoolClient,
  email: string,
  password: string,
  afterLock?: () => Promise<void>,
): Promise<ResultName> {
  try {
    await client.query('BEGIN');
    const found = await client.query<{
      id: string;
      password_hash: string;
      verified_at: Date | null;
    }>('SELECT id, password_hash, verified_at FROM accounts WHERE email = $1 FOR UPDATE', [email]);
    const account = found.rows[0];
    if (account === undefined || account.verified_at !== null) {
      await client.query('ROLLBACK');
      return 'cancellation_rejected';
    }
    if (!(await passwordMatches(password, account.password_hash))) {
      await client.query('ROLLBACK');
      return 'cancellation_rejected';
    }
    if (afterLock !== undefined) {
      await afterLock();
    }
    const again = await client.query<{ verified_at: Date | null }>(
      'SELECT verified_at FROM accounts WHERE id = $1',
      [account.id],
    );
    if ((again.rowCount ?? 0) === 0 || again.rows[0]?.verified_at) {
      await client.query('ROLLBACK');
      return 'cancellation_rejected';
    }
    await client.query('DELETE FROM accounts WHERE id = $1', [account.id]);
    await client.query('COMMIT');
    return 'ok';
  } catch {
    await rollbackQuietly(client);
    return 'operation_failed';
  }
}

function parseCancellation(body: unknown): { email: string; password: string } | undefined {
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

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
