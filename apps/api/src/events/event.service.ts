import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Temporal } from '@js-temporal/polyfill';
import type { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from '../db/pool-token';

export const EVENT_CLOCK = Symbol('EVENT_CLOCK');
import { formatOperationLog } from '../results/log';
import { httpStatus, resultBody, type ResultName } from '../results/results';
import { proofCodeMatches } from '../results/secrets';
import { readPresentedSession } from '../session/cookie';
import { resolveLocalClock, type CivilClock } from '../time/civil-time';
import { recordGeneratedTimes } from './generated-time';
import {
  civilDateOf,
  loadSnapshot,
  occurrencesToFreeze,
  saveConflicts,
  seriesAdmitsOriginal,
} from './expand';
import type { ConflictWarning } from './conflicts';
import { parseSeries, type SeriesRepetition, type SeriesTemplate } from './series-template';

type EventDraft = {
  title: string;
  location: string;
  description: string;
  visibility: 'public' | 'private';
  start: string;
  end: string;
};

type EventHooks = {
  beforeAccountLock?: () => Promise<void>;
  afterLock?: () => Promise<void>;
  beforeCommit?: () => Promise<void>;
  now?: Date;
};

type Outcome = {
  status: number;
  body: {
    result: ResultName;
    conflicts?: ConflictWarning[];
    continuesAfterWindow?: true;
    monthTypes?: string[];
    missingDates?: string[];
  };
  accountId?: string;
};

@Injectable()
export class EventService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    @Inject(EVENT_CLOCK) private readonly now: () => Date,
  ) {}

  async save(
    cookieHeader: string | undefined,
    eventId: string | undefined,
    body: unknown,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    return this.finish('save-event', (client) =>
      saveOwnedEvent(client, cookieHeader, eventId, body, { now: this.now() }),
    );
  }

  async remove(
    cookieHeader: string | undefined,
    eventId: string,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    return this.finish('delete-event', (client) => deleteOwnedEvent(client, cookieHeader, eventId));
  }

  async deleteOccurrence(
    cookieHeader: string | undefined,
    eventId: string,
    body: unknown,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    return this.finish('delete-occurrence', (client) =>
      deleteOwnedOccurrence(client, cookieHeader, eventId, body),
    );
  }

  async detach(
    cookieHeader: string | undefined,
    eventId: string,
    body: unknown,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    return this.finish('detach-event', (client) =>
      detachOwnedEvent(client, cookieHeader, eventId, body),
    );
  }

  async choose(
    cookieHeader: string | undefined,
    eventId: string,
    body: unknown,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    return this.finish('choose-start', (client) =>
      chooseOwnedStart(client, cookieHeader, eventId, body),
    );
  }

  private async finish(
    operation: string,
    work: (client: PoolClient) => Promise<Outcome>,
  ): Promise<{ status: number; body: { result: ResultName } }> {
    const client = await this.pool.connect();
    try {
      const outcome = await work(client);
      console.info(
        formatOperationLog({
          operation,
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

export async function saveOwnedEvent(
  client: PoolClient,
  cookieHeader: string | undefined,
  eventId: string | undefined,
  body: unknown,
  hooks: EventHooks = {},
): Promise<Outcome> {
  try {
    const opened = await openOwner(client, cookieHeader, hooks.beforeAccountLock);
    if (!isOwner(opened)) {
      return opened;
    }
    let storedKind: string | undefined;
    if (eventId !== undefined) {
      const existing = await lockEvent(client, eventId, opened.accountId);
      if (!isLockedEvent(existing)) {
        return withAccount(existing, opened.accountId);
      }
      storedKind = existing.repetition;
    }
    const kind = repetitionKind(body, eventId === undefined, storedKind);
    if (kind === undefined) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    if (kind !== 'none') {
      return saveSeries(client, opened, eventId, body, kind, hooks);
    }
    const draft = draftEvent(body, opened.timezone);
    if (draft === undefined) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    if (hooks.afterLock !== undefined) {
      await hooks.afterLock();
    }
    const id = eventId ?? randomUUID();
    if (eventId === undefined) {
      await client.query(
        `INSERT INTO events (
           id, calendar_id, creator_account_id, repetition, title, location, description, visibility,
           start_instant, end_instant
         ) VALUES ($1, $2, $3, 'none', $4, $5, $6, $7, $8, $9)`,
        [
          id,
          opened.calendarId,
          opened.accountId,
          draft.title,
          draft.location,
          draft.description,
          draft.visibility,
          draft.start,
          draft.end,
        ],
      );
    } else {
      await client.query(
        `UPDATE events
         SET title = $2, location = $3, description = $4, visibility = $5,
             start_instant = $6, end_instant = $7
         WHERE id = $1`,
        [
          id,
          draft.title,
          draft.location,
          draft.description,
          draft.visibility,
          draft.start,
          draft.end,
        ],
      );
    }
    const conflicts = await saveConflicts(client, {
      accountId: opened.accountId,
      eventId: id,
      timeZone: opened.timezone,
      windowDate: civilDateOf(draft.start, opened.timezone),
      savedInterval: { start: draft.start, end: draft.end },
    });
    if (hooks.beforeCommit !== undefined) {
      await hooks.beforeCommit();
    }
    if (!(await sessionStillOpen(client, opened.sessionId))) {
      await client.query('ROLLBACK');
      return rejected('logged_out');
    }
    await client.query('COMMIT');
    return {
      status: httpStatus.ok,
      body: { result: 'ok', conflicts },
      accountId: opened.accountId,
    };
  } catch {
    await rollbackQuietly(client);
    return rejected('operation_failed');
  }
}

export async function deleteOwnedEvent(
  client: PoolClient,
  cookieHeader: string | undefined,
  eventId: string,
  hooks: EventHooks = {},
): Promise<Outcome> {
  try {
    const opened = await openOwner(client, cookieHeader, hooks.beforeAccountLock);
    if (!isOwner(opened)) {
      return opened;
    }
    const existing = await lockEvent(client, eventId, opened.accountId);
    if (!isLockedEvent(existing)) {
      return withAccount(existing, opened.accountId);
    }
    if (hooks.afterLock !== undefined) {
      await hooks.afterLock();
    }
    if (existing.repetition !== 'none') {
      await client.query('DELETE FROM series_freezes WHERE series_event_id = $1', [eventId]);
      await client.query('DELETE FROM series_absences WHERE series_event_id = $1', [eventId]);
      await client.query('DELETE FROM series_skip_rules WHERE series_event_id = $1', [eventId]);
      await client.query('DELETE FROM series_choices WHERE series_event_id = $1', [eventId]);
    }
    await client.query('DELETE FROM events WHERE id = $1', [eventId]);
    if (hooks.beforeCommit !== undefined) {
      await hooks.beforeCommit();
    }
    if (!(await sessionStillOpen(client, opened.sessionId))) {
      await client.query('ROLLBACK');
      return rejected('logged_out');
    }
    await client.query('COMMIT');
    return { status: httpStatus.ok, body: resultBody('ok'), accountId: opened.accountId };
  } catch {
    await rollbackQuietly(client);
    return rejected('operation_failed');
  }
}

export async function deleteOwnedOccurrence(
  client: PoolClient,
  cookieHeader: string | undefined,
  eventId: string,
  body: unknown,
  hooks: EventHooks = {},
): Promise<Outcome> {
  try {
    const opened = await openOwner(client, cookieHeader, hooks.beforeAccountLock);
    if (!isOwner(opened)) {
      return opened;
    }
    const existing = await lockEvent(client, eventId, opened.accountId);
    if (!isLockedEvent(existing)) {
      return withAccount(existing, opened.accountId);
    }
    const originalStart = originalInstant(body);
    if (existing.repetition === 'none' || originalStart === undefined) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    const snapshot = await loadSnapshot(client, opened.accountId);
    if (snapshot === undefined || !seriesAdmitsOriginal(snapshot, eventId, originalStart)) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    if (hooks.afterLock !== undefined) {
      await hooks.afterLock();
    }
    await client.query(
      `INSERT INTO series_absences (series_event_id, original_start_instant, civil_date)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [eventId, originalStart, civilDateOf(originalStart, opened.timezone)],
    );
    if (hooks.beforeCommit !== undefined) {
      await hooks.beforeCommit();
    }
    if (!(await sessionStillOpen(client, opened.sessionId))) {
      await client.query('ROLLBACK');
      return rejected('logged_out');
    }
    await client.query('COMMIT');
    return { status: httpStatus.ok, body: resultBody('ok'), accountId: opened.accountId };
  } catch {
    await rollbackQuietly(client);
    return rejected('operation_failed');
  }
}

export async function detachOwnedEvent(
  client: PoolClient,
  cookieHeader: string | undefined,
  eventId: string,
  body: unknown,
  hooks: EventHooks = {},
): Promise<Outcome> {
  try {
    const opened = await openOwner(client, cookieHeader, hooks.beforeAccountLock);
    if (!isOwner(opened)) {
      return opened;
    }
    const existing = await lockEvent(client, eventId, opened.accountId);
    if (!isLockedEvent(existing)) {
      return withAccount(existing, opened.accountId);
    }
    const draft = draftEvent(body, opened.timezone);
    const originalStart = originalInstant(body);
    if (existing.repetition === 'none' || draft === undefined || originalStart === undefined) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    const snapshot = await loadSnapshot(client, opened.accountId);
    if (snapshot === undefined || !seriesAdmitsOriginal(snapshot, eventId, originalStart)) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    if (hooks.afterLock !== undefined) {
      await hooks.afterLock();
    }
    const id = randomUUID();
    await client.query(
      `INSERT INTO events (
         id, calendar_id, creator_account_id, repetition, title, location, description, visibility,
         start_instant, end_instant, detached_from_event_id, original_start_instant
       ) VALUES ($1, $2, $3, 'none', $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        opened.calendarId,
        opened.accountId,
        draft.title,
        draft.location,
        draft.description,
        draft.visibility,
        draft.start,
        draft.end,
        eventId,
        originalStart,
      ],
    );
    const conflicts = await saveConflicts(client, {
      accountId: opened.accountId,
      eventId: id,
      timeZone: opened.timezone,
      windowDate: civilDateOf(draft.start, opened.timezone),
      savedInterval: { start: draft.start, end: draft.end },
    });
    if (hooks.beforeCommit !== undefined) {
      await hooks.beforeCommit();
    }
    if (!(await sessionStillOpen(client, opened.sessionId))) {
      await client.query('ROLLBACK');
      return rejected('logged_out');
    }
    await client.query('COMMIT');
    return {
      status: httpStatus.ok,
      body: { result: 'ok', conflicts },
      accountId: opened.accountId,
    };
  } catch {
    await rollbackQuietly(client);
    return rejected('operation_failed');
  }
}

export async function chooseOwnedStart(
  client: PoolClient,
  cookieHeader: string | undefined,
  eventId: string,
  body: unknown,
): Promise<Outcome> {
  try {
    const opened = await openOwner(client, cookieHeader, undefined);
    if (!isOwner(opened)) {
      return opened;
    }
    const existing = await lockEvent(client, eventId, opened.accountId);
    if (!isLockedEvent(existing)) {
      return withAccount(existing, opened.accountId);
    }
    const choice = choiceBody(body);
    if (existing.repetition === 'none' || choice === undefined) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    const stored = await client.query<{ earlier_instant: Date; later_instant: Date }>(
      `SELECT earlier_instant, later_instant
       FROM series_choices
       WHERE series_event_id = $1 AND civil_date = $2`,
      [eventId, choice.date],
    );
    const row = stored.rows[0];
    const matches =
      row !== undefined &&
      (sameInstant(choice.instant, row.earlier_instant.toISOString()) ||
        sameInstant(choice.instant, row.later_instant.toISOString()));
    if (!matches) {
      await client.query('ROLLBACK');
      return rejected('save_rejected', opened.accountId);
    }
    await client.query(
      `UPDATE series_choices
       SET chosen_instant = $3
       WHERE series_event_id = $1 AND civil_date = $2`,
      [eventId, choice.date, choice.instant],
    );
    if (!(await sessionStillOpen(client, opened.sessionId))) {
      await client.query('ROLLBACK');
      return rejected('logged_out');
    }
    await client.query('COMMIT');
    return { status: httpStatus.ok, body: resultBody('ok'), accountId: opened.accountId };
  } catch {
    await rollbackQuietly(client);
    return rejected('operation_failed');
  }
}

type Owner = {
  status: number;
  body: { result: ResultName };
  accountId: string;
  sessionId: string;
  timezone: string;
  calendarId: string;
};

type OpenOwner = Outcome | Owner;

async function openOwner(
  client: PoolClient,
  cookieHeader: string | undefined,
  beforeAccountLock: (() => Promise<void>) | undefined,
): Promise<OpenOwner> {
  const presented = readPresentedSession(cookieHeader);
  if (presented === undefined) {
    return rejected('logged_out');
  }
  await client.query('BEGIN');
  const session = await client.query<{
    account_id: string;
    secret_hash: string;
    ended_at: Date | null;
  }>('SELECT account_id, secret_hash, ended_at FROM sessions WHERE id = $1', [presented.sessionId]);
  const current = session.rows[0];
  if (
    current === undefined ||
    current.ended_at !== null ||
    !proofCodeMatches(presented.secret, current.secret_hash)
  ) {
    await client.query('ROLLBACK');
    return rejected('logged_out');
  }
  if (beforeAccountLock !== undefined) {
    await beforeAccountLock();
  }
  const account = await client.query<{ timezone: string }>(
    'SELECT timezone FROM accounts WHERE id = $1 FOR UPDATE',
    [current.account_id],
  );
  if (account.rows[0] === undefined) {
    await client.query('ROLLBACK');
    return rejected('account_gone');
  }
  const still = await client.query<{ secret_hash: string; ended_at: Date | null }>(
    'SELECT secret_hash, ended_at FROM sessions WHERE id = $1 FOR UPDATE',
    [presented.sessionId],
  );
  const locked = still.rows[0];
  if (
    locked === undefined ||
    locked.ended_at !== null ||
    !proofCodeMatches(presented.secret, locked.secret_hash)
  ) {
    await client.query('ROLLBACK');
    return rejected('logged_out');
  }
  const calendar = await client.query<{ id: string }>(
    `SELECT id FROM calendars WHERE owner_account_id = $1 AND kind = 'personal'`,
    [current.account_id],
  );
  const calendarId = calendar.rows[0]?.id;
  const timezone = account.rows[0]?.timezone;
  if (calendarId === undefined || timezone === undefined) {
    await client.query('ROLLBACK');
    return rejected('operation_failed', current.account_id);
  }
  return {
    status: httpStatus.ok,
    body: resultBody('ok'),
    accountId: current.account_id,
    sessionId: presented.sessionId,
    timezone,
    calendarId,
  };
}

async function lockEvent(
  client: PoolClient,
  eventId: string,
  accountId: string,
): Promise<{ repetition: string } | Outcome> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
    await client.query('ROLLBACK');
    return rejected('not_found');
  }
  const found = await client.query<{ creator_account_id: string; repetition: string }>(
    'SELECT creator_account_id, repetition FROM events WHERE id = $1 FOR UPDATE',
    [eventId],
  );
  const event = found.rows[0];
  if (event === undefined || event.creator_account_id !== accountId) {
    await client.query('ROLLBACK');
    return rejected('not_found');
  }
  return { repetition: event.repetition };
}

function isOwner(value: OpenOwner): value is Owner {
  return 'timezone' in value;
}

function isLockedEvent(value: { repetition: string } | Outcome): value is { repetition: string } {
  return 'repetition' in value;
}

function withAccount(outcome: Outcome, accountId: string): Outcome {
  if (outcome.accountId !== undefined) {
    return outcome;
  }
  return { status: outcome.status, body: outcome.body, accountId };
}

async function saveSeries(
  client: PoolClient,
  opened: Owner,
  eventId: string | undefined,
  body: unknown,
  kind: SeriesRepetition,
  hooks: EventHooks,
): Promise<Outcome> {
  const parsed = parseSeries(body, opened.timezone, kind);
  if (parsed === undefined) {
    await client.query('ROLLBACK');
    return rejected('save_rejected', opened.accountId);
  }
  if ('preview' in parsed) {
    await client.query('ROLLBACK');
    return {
      status: httpStatus.save_rejected,
      body: { result: 'save_rejected', ...parsed.preview },
      accountId: opened.accountId,
    };
  }
  if (hooks.afterLock !== undefined) {
    await hooks.afterLock();
  }
  const template = parsed.template;
  const id = eventId ?? randomUUID();
  if (eventId !== undefined) {
    await freezeReachedOccurrences(client, opened, eventId, template, hooks.now ?? new Date());
  }
  if (eventId === undefined) {
    await client.query(
      `INSERT INTO events (
         id, calendar_id, creator_account_id, repetition, title, location, description, visibility,
         local_start, local_end, anchor_date, weekday, month_day
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        opened.calendarId,
        opened.accountId,
        template.repetition,
        template.title,
        template.location,
        template.description,
        template.visibility,
        template.localStart,
        template.localEnd,
        template.anchorDate,
        template.weekday,
        template.monthDay,
      ],
    );
  } else {
    await client.query(
      `UPDATE events
       SET title = $2, location = $3, description = $4, visibility = $5,
           local_start = $6, local_end = $7, anchor_date = $8, weekday = $9, month_day = $10
       WHERE id = $1`,
      [
        id,
        template.title,
        template.location,
        template.description,
        template.visibility,
        template.localStart,
        template.localEnd,
        template.anchorDate,
        template.weekday,
        template.monthDay,
      ],
    );
  }
  await recordGeneratedTimes(client, {
    seriesId: id,
    timeZone: opened.timezone,
    repetition: template.repetition,
    anchorDate: template.anchorDate,
    localStart: template.localStart,
    localEnd: template.localEnd,
    weekday: template.weekday,
    monthDay: template.monthDay,
  });
  const conflicts = await saveConflicts(client, {
    accountId: opened.accountId,
    eventId: id,
    timeZone: opened.timezone,
    windowDate: template.anchorDate,
  });
  if (hooks.beforeCommit !== undefined) {
    await hooks.beforeCommit();
  }
  if (!(await sessionStillOpen(client, opened.sessionId))) {
    await client.query('ROLLBACK');
    return rejected('logged_out');
  }
  await client.query('COMMIT');
  return {
    status: httpStatus.ok,
    body: { result: 'ok', conflicts, continuesAfterWindow: true },
    accountId: opened.accountId,
  };
}

async function freezeReachedOccurrences(
  client: PoolClient,
  opened: Owner,
  eventId: string,
  template: SeriesTemplate,
  now: Date,
): Promise<void> {
  const stored = await client.query<{
    local_start: string;
    local_end: string;
    anchor_date: string;
    weekday: number | null;
    month_day: number | null;
  }>(
    `SELECT local_start::text, local_end::text, anchor_date::text, weekday, month_day
     FROM events WHERE id = $1`,
    [eventId],
  );
  const current = stored.rows[0];
  if (
    current === undefined ||
    (current.local_start === template.localStart &&
      current.local_end === template.localEnd &&
      current.anchor_date === template.anchorDate &&
      current.weekday === template.weekday &&
      current.month_day === template.monthDay)
  ) {
    return;
  }
  const snapshot = await loadSnapshot(client, opened.accountId);
  if (snapshot === undefined) {
    return;
  }
  const reached = occurrencesToFreeze(snapshot, eventId, now.toISOString());
  if (reached.length === 0) {
    return;
  }
  await client.query(
    `INSERT INTO series_freezes (series_event_id, original_start_instant, start_instant, end_instant)
     SELECT $1, original_start, start_instant, end_instant
     FROM unnest($2::timestamptz[], $3::timestamptz[], $4::timestamptz[])
       AS reached(original_start, start_instant, end_instant)
     ON CONFLICT DO NOTHING`,
    [
      eventId,
      reached.map((occurrence) => occurrence.originalStart ?? occurrence.start),
      reached.map((occurrence) => occurrence.start),
      reached.map((occurrence) => occurrence.end),
    ],
  );
}

function repetitionKind(
  body: unknown,
  creating: boolean,
  stored: string | undefined,
): 'none' | SeriesRepetition | undefined {
  const requested = requestedRepetition(body);
  if (requested.invalid) {
    return undefined;
  }
  if (creating) {
    return requested.kind;
  }
  if (stored !== 'none' && stored !== 'daily' && stored !== 'weekly' && stored !== 'monthly') {
    return undefined;
  }
  if (requested.kind === undefined) {
    return stored;
  }
  return requested.kind === stored ? stored : undefined;
}

function requestedRepetition(body: unknown): {
  kind?: 'none' | SeriesRepetition;
  invalid: boolean;
} {
  if (typeof body !== 'object' || body === null || !('repetition' in body)) {
    return { invalid: false };
  }
  const value = (body as Record<string, unknown>).repetition;
  if (value === 'none' || value === 'daily' || value === 'weekly' || value === 'monthly') {
    return { kind: value, invalid: false };
  }
  return { invalid: true };
}

function draftEvent(body: unknown, zone: string): EventDraft | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.title !== 'string') {
    return undefined;
  }
  const title = record.title.trim();
  if (title === '') {
    return undefined;
  }
  const visibility = parseVisibility(record.visibility);
  const start = resolveEnteredStart(zone, record.start, record.chosenStart);
  const end = resolveEnteredClock(zone, record.end);
  if (
    visibility === undefined ||
    start === undefined ||
    end === undefined ||
    Temporal.Instant.compare(start, end) >= 0
  ) {
    return undefined;
  }
  if (typeof record.location !== 'string' && record.location !== undefined) {
    return undefined;
  }
  if (typeof record.description !== 'string' && record.description !== undefined) {
    return undefined;
  }
  return {
    title,
    location: typeof record.location === 'string' ? record.location : '',
    description: typeof record.description === 'string' ? record.description : '',
    visibility,
    start,
    end,
  };
}

function choiceBody(body: unknown): { date: string; instant: string } | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as { date?: unknown; instant?: unknown };
  if (typeof record.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    return undefined;
  }
  const instant = instantString(record.instant);
  if (instant === undefined) {
    return undefined;
  }
  return { date: record.date, instant };
}

function originalInstant(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('originalStart' in body)) {
    return undefined;
  }
  const value = (body as { originalStart?: unknown }).originalStart;
  if (typeof value !== 'string') {
    return undefined;
  }
  try {
    return new Date(Temporal.Instant.from(value).epochMilliseconds).toISOString();
  } catch {
    return undefined;
  }
}

function parseVisibility(value: unknown): 'public' | 'private' | undefined {
  if (value === undefined || value === 'private') {
    return 'private';
  }
  if (value === 'public') {
    return 'public';
  }
  return undefined;
}

function resolveEnteredStart(
  zone: string,
  value: unknown,
  chosenStart: unknown,
): string | undefined {
  const clock = parseClock(value);
  if (clock === undefined) {
    return undefined;
  }
  const resolved = resolveLocalClock(zone, clock);
  if (resolved.outcome === 'instant') {
    return resolved.instant;
  }
  if (resolved.outcome !== 'twice') {
    return undefined;
  }
  const chosen = instantString(chosenStart);
  if (
    chosen !== undefined &&
    (sameInstant(chosen, resolved.earlier) || sameInstant(chosen, resolved.later))
  ) {
    return chosen;
  }
  return undefined;
}

function resolveEnteredClock(zone: string, value: unknown): string | undefined {
  const clock = parseClock(value);
  if (clock === undefined) {
    return undefined;
  }
  const resolved = resolveLocalClock(zone, clock);
  if (resolved.outcome !== 'instant') {
    return undefined;
  }
  return resolved.instant;
}

function instantString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  try {
    return new Date(Temporal.Instant.from(value).epochMilliseconds).toISOString();
  } catch {
    return undefined;
  }
}

function sameInstant(left: string, right: string): boolean {
  return (
    Temporal.Instant.from(left).epochMilliseconds === Temporal.Instant.from(right).epochMilliseconds
  );
}

function parseClock(value: unknown): CivilClock | undefined {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(value);
    if (match === null) {
      return undefined;
    }
    return clockFrom(match[1], match[2], match[3], match[4], match[5]);
  }
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.date !== 'string' || typeof record.time !== 'string') {
    return undefined;
  }
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(record.date);
  const time = /^(\d{2}):(\d{2})$/.exec(record.time);
  if (date === null || time === null) {
    return undefined;
  }
  return clockFrom(date[1], date[2], date[3], time[1], time[2]);
}

function clockFrom(
  year: string | undefined,
  month: string | undefined,
  day: string | undefined,
  hour: string | undefined,
  minute: string | undefined,
): CivilClock | undefined {
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    hour === undefined ||
    minute === undefined
  ) {
    return undefined;
  }
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };
}

async function sessionStillOpen(client: PoolClient, sessionId: string): Promise<boolean> {
  const found = await client.query<{ ended_at: Date | null }>(
    'SELECT ended_at FROM sessions WHERE id = $1',
    [sessionId],
  );
  return found.rows[0] !== undefined && found.rows[0].ended_at === null;
}

function rejected(result: ResultName, accountId?: string): Outcome {
  return {
    status: httpStatus[result],
    body: resultBody(result),
    ...(accountId === undefined ? {} : { accountId }),
  };
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    return undefined;
  }
}
