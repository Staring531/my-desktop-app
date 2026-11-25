import type { PoolClient } from 'pg';
import { formatOperationLog, formatSendFailedLog } from '../results/log';
import { httpStatus, resultBody, type ResultBody, type ResultName } from '../results/results';

const MAIL_LOCK_KEY = 814082;

export const MAIL_WAIT_MS = 10_000;

export type ProofMessage = { to: string; code: string };

export type MailPort = {
  canSend(): Promise<boolean>;
  sendProof(message: ProofMessage): Promise<'accepted' | 'rejected'>;
};

export type PreparedSend =
  { action: 'send'; message: ProofMessage } | { action: 'result'; result: ResultName };

export type ProofSendOutcome = { status: number; body: ResultBody };

export async function runProofSend(input: {
  client: PoolClient;
  port: MailPort;
  operation: string;
  accountId?: string;
  successResult?: ResultName;
  waitMs?: number;
  log?: (line: string) => void;
  prepare: (client: PoolClient) => Promise<PreparedSend>;
}): Promise<ProofSendOutcome> {
  const waitMs = input.waitMs ?? MAIL_WAIT_MS;
  const write = input.log ?? (() => undefined);
  let locked = false;
  const finish = async (result: ResultName): Promise<ProofSendOutcome> => {
    write(
      formatOperationLog({
        operation: input.operation,
        result,
        ...(input.accountId === undefined ? {} : { accountId: input.accountId }),
      }),
    );
    if (locked) {
      await input.client.query('SELECT pg_advisory_unlock($1)', [MAIL_LOCK_KEY]);
      locked = false;
    }
    return { status: httpStatus[result], body: resultBody(result) };
  };

  const before = await rejectionCount(input.client);
  await input.client.query('SELECT pg_advisory_lock($1)', [MAIL_LOCK_KEY]);
  locked = true;
  if ((await rejectionCount(input.client)) !== before) {
    return finish('send_failed');
  }

  const able = await within(input.port.canSend(), waitMs);
  if (able !== true) {
    return finish('send_failed');
  }

  let accepted = false;
  try {
    await input.client.query('BEGIN');
    const prepared = await input.prepare(input.client);
    if (prepared.action === 'result') {
      await input.client.query('ROLLBACK');
      return finish(prepared.result);
    }
    const sent = await within(input.port.sendProof(prepared.message), waitMs);
    if (sent !== 'accepted') {
      await input.client.query('ROLLBACK');
      await input.client.query(
        'UPDATE mail_gate SET rejection_count = rejection_count + 1 WHERE id = 1',
      );
      write(formatSendFailedLog());
      return finish('send_failed');
    }
    accepted = true;
    await input.client.query('COMMIT');
    return finish(input.successResult ?? 'ok');
  } catch {
    await rollbackQuietly(input.client);
    if (accepted) {
      return finish('operation_failed');
    }
    return finish('operation_failed');
  }
}

async function rejectionCount(client: PoolClient): Promise<string> {
  const row = await client.query<{ rejection_count: string }>(
    'SELECT rejection_count FROM mail_gate WHERE id = 1',
  );
  return row.rows[0]?.rejection_count ?? '0';
}

async function within<T>(work: Promise<T>, waitMs: number): Promise<T | undefined> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<undefined>((resolve) => {
        timer = setTimeout(() => resolve(undefined), waitMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
