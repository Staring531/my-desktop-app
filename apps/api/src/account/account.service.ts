import { Inject, Injectable } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';
import { recordGeneratedTimes } from '../events/generated-time';
import { loadSnapshot, occurrencesToFreeze } from '../events/expand';
import { EVENT_CLOCK } from '../events/event.service';
import { storedNickname } from '../identity/display-name';
import { formatOperationLog } from '../results/log';
import { httpStatus, resultBody, type ResultName } from '../results/results';
import { readPresentedSession } from '../session/cookie';
import { lockOpenSession } from '../session/session.service';
import { resolveTimeZone } from '../time/civil-time';

@Injectable()
export class AccountService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(EVENT_CLOCK) private readonly now: () => Date,
  ) {}

  async changeTimezone(
    cookieHeader: string | undefined,
    body: unknown,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    const client = await this.pool.connect();
    try {
      const outcome = await changeOwnedTimezone(client, cookieHeader, body, this.now());
      console.info(
        formatOperationLog({
          operation: 'change-timezone',
          result: outcome.result,
          ...(outcome.accountId === undefined ? {} : { accountId: outcome.accountId }),
        }),
      );
      return { status: httpStatus[outcome.result], body: resultBody(outcome.result) };
    } finally {
      client.release();
    }
  }

  async remove(
    cookieHeader: string | undefined,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    const client = await this.pool.connect();
    try {
      const outcome = await deleteOwnedAccount(client, cookieHeader);
      console.info(
        formatOperationLog({
          operation: 'delete-account',
          result: outcome.result,
          ...(outcome.accountId === undefined ? {} : { accountId: outcome.accountId }),
        }),
      );
      return { status: httpStatus[outcome.result], body: resultBody(outcome.result) };
    } finally {
      client.release();
    }
  }

  async changeNickname(
    cookieHeader: string | undefined,
    body: unknown,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    const client = await this.pool.connect();
    try {
      const outcome = await storeNickname(client, cookieHeader, body);
      console.info(
        formatOperationLog({
          operation: 'change-nickname',
          result: outcome.result,
          ...(outcome.accountId === undefined ? {} : { accountId: outcome.accountId }),
        }),
      );
      return { status: httpStatus[outcome.result], body: resultBody(outcome.result) };
    } finally {
      client.release();
    }
  }
}

export type AccountHooks = {
  afterLock?: () => Promise<void>;
  beforeCommit?: () => Promise<void>;
};

export async function deleteOwnedAccount(
  client: PoolClient,
  cookieHeader: string | undefined,
  hooks: AccountHooks = {},
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
    const account = await client.query<{ username: string }>(
      'SELECT username FROM accounts WHERE id = $1 FOR UPDATE',
      [open.accountId],
    );
    const username = account.rows[0]?.username;
    if (username === undefined) {
      await client.query('ROLLBACK');
      return { result: 'account_gone', accountId: open.accountId };
    }
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0))', [username]);
    if (hooks.afterLock !== undefined) {
      await hooks.afterLock();
    }
    await client.query(
      `DELETE FROM series_freezes
       WHERE series_event_id IN (SELECT id FROM events WHERE creator_account_id = $1)`,
      [open.accountId],
    );
    await client.query(
      `DELETE FROM series_absences
       WHERE series_event_id IN (SELECT id FROM events WHERE creator_account_id = $1)`,
      [open.accountId],
    );
    await client.query(
      `DELETE FROM series_skip_rules
       WHERE series_event_id IN (SELECT id FROM events WHERE creator_account_id = $1)`,
      [open.accountId],
    );
    await client.query(
      `DELETE FROM series_choices
       WHERE series_event_id IN (SELECT id FROM events WHERE creator_account_id = $1)`,
      [open.accountId],
    );
    await client.query('DELETE FROM events WHERE creator_account_id = $1', [open.accountId]);
    await client.query('DELETE FROM calendars WHERE owner_account_id = $1', [open.accountId]);
    await client.query('DELETE FROM accounts WHERE id = $1', [open.accountId]);
    await client.query('INSERT INTO retired_usernames (username, retired_at) VALUES ($1, now())', [
      username,
    ]);
    if (hooks.beforeCommit !== undefined) {
      await hooks.beforeCommit();
    }
    await client.query('COMMIT');
    return { result: 'ok', accountId: open.accountId };
  } catch {
    await rollbackQuietly(client);
    return { result: 'operation_failed' };
  }
}

export async function changeOwnedTimezone(
  client: PoolClient,
  cookieHeader: string | undefined,
  body: unknown,
  now: Date,
  hooks: AccountHooks = {},
): Promise<{ result: ResultName; accountId?: string }> {
  const presented = readPresentedSession(cookieHeader);
  if (presented === undefined) {
    return { result: 'logged_out' };
  }
  const timezone = parseTimezone(body);
  try {
    await client.query('BEGIN');
    const open = await lockOpenSession(client, presented.sessionId, presented.secret);
    if (open === undefined) {
      await client.query('ROLLBACK');
      return { result: 'logged_out' };
    }
    if (timezone === undefined || !resolveTimeZone(timezone)) {
      await client.query('ROLLBACK');
      return { result: 'save_rejected', accountId: open.accountId };
    }
    const account = await client.query<{ timezone: string }>(
      'SELECT timezone FROM accounts WHERE id = $1 FOR UPDATE',
      [open.accountId],
    );
    const current = account.rows[0]?.timezone;
    if (current === undefined) {
      await client.query('ROLLBACK');
      return { result: 'account_gone', accountId: open.accountId };
    }
    await client.query(
      `SELECT id FROM events
       WHERE creator_account_id = $1 AND repetition <> 'none'
       ORDER BY id
       FOR UPDATE`,
      [open.accountId],
    );
    const snapshot = await loadSnapshot(client, open.accountId);
    if (snapshot === undefined) {
      await client.query('ROLLBACK');
      return { result: 'account_gone', accountId: open.accountId };
    }
    if (hooks.afterLock !== undefined) {
      await hooks.afterLock();
    }
    for (const series of snapshot.series) {
      const reached = occurrencesToFreeze(snapshot, series.id, now.toISOString());
      if (reached.length > 0) {
        await client.query(
          `INSERT INTO series_freezes (series_event_id, original_start_instant, start_instant, end_instant)
           SELECT $1, original_start, start_instant, end_instant
           FROM unnest($2::timestamptz[], $3::timestamptz[], $4::timestamptz[])
             AS reached(original_start, start_instant, end_instant)
           ON CONFLICT DO NOTHING`,
          [
            series.id,
            reached.map((occurrence) => occurrence.originalStart ?? occurrence.start),
            reached.map((occurrence) => occurrence.start),
            reached.map((occurrence) => occurrence.end),
          ],
        );
      }
      const generated = {
        seriesId: series.id,
        repetition: series.repetition,
        anchorDate: series.anchorDate,
        localStart: series.localStart,
        localEnd: series.localEnd,
        weekday: series.weekday,
        monthDay: series.monthDay,
      };
      await recordGeneratedTimes(client, { ...generated, timeZone: current });
      await recordGeneratedTimes(client, { ...generated, timeZone: timezone });
    }
    await client.query('UPDATE accounts SET timezone = $2 WHERE id = $1', [
      open.accountId,
      timezone,
    ]);
    const session = await client.query<{ ended_at: Date | null }>(
      'SELECT ended_at FROM sessions WHERE id = $1',
      [open.sessionId],
    );
    if (session.rows[0]?.ended_at !== null) {
      await client.query('ROLLBACK');
      return { result: 'logged_out' };
    }
    await client.query('COMMIT');
    return { result: 'ok', accountId: open.accountId };
  } catch {
    await rollbackQuietly(client);
    return { result: 'operation_failed' };
  }
}

function parseTimezone(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const timezone = (body as Record<string, unknown>).timezone;
  if (typeof timezone !== 'string' || timezone === '') {
    return undefined;
  }
  return timezone;
}

async function storeNickname(
  client: PoolClient,
  cookieHeader: string | undefined,
  body: unknown,
): Promise<{ result: ResultName; accountId?: string }> {
  const presented = readPresentedSession(cookieHeader);
  if (presented === undefined) {
    return { result: 'logged_out' };
  }
  const nickname = parseNickname(body);
  try {
    await client.query('BEGIN');
    const open = await lockOpenSession(client, presented.sessionId, presented.secret);
    if (open === undefined) {
      await client.query('ROLLBACK');
      return { result: 'logged_out' };
    }
    if (nickname === undefined) {
      await client.query('ROLLBACK');
      return { result: 'save_rejected', accountId: open.accountId };
    }
    await client.query('UPDATE accounts SET nickname = $2 WHERE id = $1', [
      open.accountId,
      nickname,
    ]);
    await client.query('COMMIT');
    return { result: 'ok', accountId: open.accountId };
  } catch {
    await rollbackQuietly(client);
    return { result: 'operation_failed' };
  }
}

function parseNickname(body: unknown): string | null | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const nickname = (body as Record<string, unknown>).nickname;
  if (typeof nickname !== 'string') {
    return undefined;
  }
  return storedNickname(nickname);
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
