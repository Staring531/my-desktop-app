import { Inject, Injectable } from '@nestjs/common';
import { Temporal } from '@js-temporal/polyfill';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';
import { displayName } from '../identity/display-name';
import { formatOperationLog } from '../results/log';
import { httpStatus, resultBody, type ResultName } from '../results/results';
import { readPresentedSession } from '../session/cookie';
import { lockOpenSession } from '../session/session.service';
import { expandRange, loadSnapshot, type ExpandedOccurrence } from '../events/expand';

type Occurrence = {
  id: string;
  state: 'scheduled' | 'skipped' | 'choice_required';
  visibility: 'public' | 'private';
  title: string;
  location: string;
  description: string;
  displayName: string;
  date: string;
  start?: string;
  end?: string;
  originalStart?: string;
  instants?: [string, string];
};

type CalendarBody =
  | { result: 'ok'; calendar: { id: string; kind: 'personal' }; occurrences: Occurrence[] }
  | { result: ResultName };

@Injectable()
export class CalendarService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async read(
    cookieHeader: string | undefined,
    from: string | undefined,
    to: string | undefined,
  ): Promise<{ status: number; body: CalendarBody }> {
    const client = await this.pool.connect();
    try {
      const outcome = await readCalendar(client, cookieHeader, from, to);
      console.info(
        formatOperationLog({
          operation: 'read-calendar',
          result: outcome.body.result,
          ...(outcome.accountId === undefined ? {} : { accountId: outcome.accountId }),
        }),
      );
      return { status: outcome.status, body: outcome.body };
    } finally {
      client.release();
    }
  }
}

async function readCalendar(
  client: PoolClient,
  cookieHeader: string | undefined,
  from: string | undefined,
  to: string | undefined,
): Promise<{ status: number; body: CalendarBody; accountId?: string }> {
  const presented = readPresentedSession(cookieHeader);
  if (presented === undefined) {
    return { status: httpStatus.logged_out, body: resultBody('logged_out') };
  }
  try {
    await client.query('BEGIN');
    const open = await lockOpenSession(client, presented.sessionId, presented.secret);
    if (open === undefined) {
      await client.query('ROLLBACK');
      return { status: httpStatus.logged_out, body: resultBody('logged_out') };
    }
    const start = parseCivilDate(from);
    const end = parseCivilDate(to);
    if (start === undefined || end === undefined) {
      await client.query('ROLLBACK');
      return {
        status: httpStatus.save_rejected,
        body: resultBody('save_rejected'),
        accountId: open.accountId,
      };
    }
    const account = await client.query<{ username: string; nickname: string | null }>(
      'SELECT username, nickname FROM accounts WHERE id = $1',
      [open.accountId],
    );
    const calendar = await client.query<{ id: string }>(
      `SELECT id FROM calendars WHERE owner_account_id = $1 AND kind = 'personal'`,
      [open.accountId],
    );
    const calendarId = calendar.rows[0]?.id;
    const owner = account.rows[0];
    if (calendarId === undefined || owner === undefined) {
      await client.query('COMMIT');
      return { status: httpStatus.ok, body: { result: 'ok' }, accountId: open.accountId };
    }
    const snapshot = await loadSnapshot(client, open.accountId);
    await client.query('COMMIT');
    const name = displayName(owner);
    return {
      status: httpStatus.ok,
      accountId: open.accountId,
      body: {
        result: 'ok',
        calendar: { id: calendarId, kind: 'personal' },
        occurrences:
          snapshot === undefined
            ? []
            : expandRange(snapshot, start, end).map((row) => toOccurrence(row, name)),
      },
    };
  } catch {
    await rollbackQuietly(client);
    return { status: httpStatus.operation_failed, body: resultBody('operation_failed') };
  }
}

function toOccurrence(row: ExpandedOccurrence, name: string): Occurrence {
  const base = {
    id: row.id,
    visibility: row.visibility,
    title: row.title,
    location: row.location,
    description: row.description,
    displayName: name,
    date: row.date,
  };
  if (row.state === 'scheduled' && row.start !== undefined && row.end !== undefined) {
    return {
      ...base,
      state: 'scheduled',
      start: row.start,
      end: row.end,
      ...(row.originalStart === undefined ? {} : { originalStart: row.originalStart }),
    };
  }
  if (row.state === 'choice_required' && row.instants !== undefined) {
    return { ...base, state: 'choice_required', instants: row.instants };
  }
  return { ...base, state: 'skipped' };
}

function parseCivilDate(value: string | undefined): string | undefined {
  if (value === undefined || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  try {
    Temporal.PlainDate.from(value, { overflow: 'reject' });
    return value;
  } catch {
    return undefined;
  }
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
