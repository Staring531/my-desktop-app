import { Temporal } from '@js-temporal/polyfill';
import type { PoolClient } from 'pg';
import { calendarWindow, resolveLocalClock, type CivilClock } from '../time/civil-time';
import type { ConflictWarning } from './conflicts';

export type ExpandedOccurrence = {
  id: string;
  state: 'scheduled' | 'skipped' | 'choice_required';
  visibility: 'public' | 'private';
  title: string;
  location: string;
  description: string;
  date: string;
  start?: string;
  end?: string;
  originalStart?: string;
  instants?: [string, string];
};

type SeriesRow = {
  id: string;
  repetition: 'daily' | 'weekly' | 'monthly';
  title: string;
  location: string;
  description: string;
  visibility: 'public' | 'private';
  localStart: string;
  localEnd: string;
  anchorDate: string;
  weekday: number | null;
  monthDay: number | null;
};

type NoneRow = {
  id: string;
  title: string;
  location: string;
  description: string;
  visibility: 'public' | 'private';
  start: string;
  end: string;
};

type FreezeRow = { seriesId: string; originalStart: string; start: string; end: string };
type AbsenceRow = { seriesId: string; civilDate: string };
type SkipRow = { seriesId: string; timeZone: string; localStart: string; localEnd: string };
type ChoiceRow = {
  seriesId: string;
  civilDate: string;
  earlier: string;
  later: string;
  chosen: string | null;
};

type DetachedRow = { seriesId: string; originalStart: string };

type Snapshot = {
  timeZone: string;
  series: SeriesRow[];
  none: NoneRow[];
  freezes: FreezeRow[];
  absences: AbsenceRow[];
  skips: SkipRow[];
  choices: ChoiceRow[];
  detached: DetachedRow[];
};

type Interval = { title: string; start: string; end: string };

export async function loadSnapshot(
  client: PoolClient,
  accountId: string,
): Promise<Snapshot | undefined> {
  const account = await client.query<{ timezone: string }>(
    'SELECT timezone FROM accounts WHERE id = $1',
    [accountId],
  );
  const timeZone = account.rows[0]?.timezone;
  if (timeZone === undefined) {
    return undefined;
  }
  const series = await client.query<{
    id: string;
    repetition: 'daily' | 'weekly' | 'monthly';
    title: string;
    location: string;
    description: string;
    visibility: 'public' | 'private';
    local_start: string;
    local_end: string;
    anchor_date: string;
    weekday: number | null;
    month_day: number | null;
  }>(
    `SELECT id, repetition, title, location, description, visibility,
            local_start::text, local_end::text, anchor_date::text, weekday, month_day
     FROM events
     WHERE creator_account_id = $1 AND repetition <> 'none'
     ORDER BY anchor_date, id`,
    [accountId],
  );
  const none = await client.query<{
    id: string;
    title: string;
    location: string;
    description: string;
    visibility: 'public' | 'private';
    start_instant: Date;
    end_instant: Date;
  }>(
    `SELECT id, title, location, description, visibility, start_instant, end_instant
     FROM events
     WHERE creator_account_id = $1
       AND repetition = 'none'
       AND start_instant IS NOT NULL
       AND end_instant IS NOT NULL
     ORDER BY start_instant, id`,
    [accountId],
  );
  const seriesIds = series.rows.map((row) => row.id);
  const facts = await loadFacts(client, seriesIds);
  const detached = await client.query<{
    detached_from_event_id: string;
    original_start_instant: Date;
  }>(
    `SELECT detached_from_event_id, original_start_instant
     FROM events
     WHERE creator_account_id = $1
       AND detached_from_event_id IS NOT NULL
       AND original_start_instant IS NOT NULL`,
    [accountId],
  );
  return {
    timeZone,
    series: series.rows.map((row) => ({
      id: row.id,
      repetition: row.repetition,
      title: row.title,
      location: row.location,
      description: row.description,
      visibility: row.visibility,
      localStart: row.local_start,
      localEnd: row.local_end,
      anchorDate: row.anchor_date,
      weekday: row.weekday,
      monthDay: row.month_day,
    })),
    none: none.rows.map((row) => ({
      id: row.id,
      title: row.title,
      location: row.location,
      description: row.description,
      visibility: row.visibility,
      start: row.start_instant.toISOString(),
      end: row.end_instant.toISOString(),
    })),
    ...facts,
    detached: detached.rows.map((row) => ({
      seriesId: row.detached_from_event_id,
      originalStart: row.original_start_instant.toISOString(),
    })),
  };
}

export function expandRange(snapshot: Snapshot, from: string, to: string): ExpandedOccurrence[] {
  const dates = eachDate(from, to);
  const occurrences: ExpandedOccurrence[] = [];
  for (const row of snapshot.none) {
    const date = civilDateOf(row.start, snapshot.timeZone);
    if (date < from || date > to) {
      continue;
    }
    occurrences.push({
      id: row.id,
      state: 'scheduled',
      visibility: row.visibility,
      title: row.title,
      location: row.location,
      description: row.description,
      date,
      start: row.start,
      end: row.end,
    });
  }
  for (const series of snapshot.series) {
    occurrences.push(...expandSeries(snapshot, series, dates));
  }
  occurrences.sort(compareOccurrences);
  return occurrences;
}

export async function saveConflicts(
  client: PoolClient,
  input: {
    accountId: string;
    eventId: string;
    timeZone: string;
    windowDate: string;
    savedInterval?: { start: string; end: string };
  },
): Promise<ConflictWarning[]> {
  const dates = calendarWindow(input.timeZone, plainDate(input.windowDate), 90);
  if (dates === undefined) {
    throw new Error('conflict window');
  }
  const snapshot = await loadSnapshot(client, input.accountId);
  if (snapshot === undefined) {
    throw new Error('conflict snapshot');
  }
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first === undefined || last === undefined) {
    throw new Error('conflict window');
  }
  const bounds = windowBounds(input.timeZone, first, last);
  const savedSeries = snapshot.series.find((series) => series.id === input.eventId);
  const saved =
    savedSeries === undefined
      ? input.savedInterval === undefined
        ? []
        : [{ title: '', ...input.savedInterval }]
      : scheduledIntervals(expandSeries(snapshot, savedSeries, dates));
  const others: Interval[] = snapshot.none
    .filter((row) => row.id !== input.eventId)
    .map((row) => ({ title: row.title, start: row.start, end: row.end }));
  for (const series of snapshot.series) {
    if (series.id === input.eventId) {
      continue;
    }
    others.push(...scheduledIntervals(expandSeries(snapshot, series, dates)));
  }
  const warnings: ConflictWarning[] = [];
  for (const other of others) {
    if (saved.some((interval) => overlaps(interval, other, bounds))) {
      warnings.push({ title: other.title, start: other.start, end: other.end });
    }
  }
  warnings.sort(
    (left, right) => left.start.localeCompare(right.start) || left.title.localeCompare(right.title),
  );
  return warnings;
}

export function seriesAdmitsOriginal(
  snapshot: Snapshot,
  seriesId: string,
  originalStart: string,
): boolean {
  const series = snapshot.series.find((row) => row.id === seriesId);
  if (series === undefined) {
    return false;
  }
  const already = snapshot.detached.some(
    (row) => row.seriesId === seriesId && row.originalStart === stamp(originalStart),
  );
  if (already) {
    return false;
  }
  const date = civilDateOf(originalStart, snapshot.timeZone);
  if (date >= series.anchorDate && matches(series, date)) {
    return true;
  }
  return snapshot.freezes.some(
    (row) => row.seriesId === seriesId && row.originalStart === stamp(originalStart),
  );
}

export function occurrencesToFreeze(
  snapshot: Snapshot,
  seriesId: string,
  now: string,
): ExpandedOccurrence[] {
  const series = snapshot.series.find((row) => row.id === seriesId);
  if (series === undefined) {
    return [];
  }
  const today = civilDateOf(now, snapshot.timeZone);
  if (today < series.anchorDate) {
    return [];
  }
  return expandSeries(snapshot, series, eachDate(series.anchorDate, today)).filter(
    (occurrence) =>
      occurrence.state === 'scheduled' &&
      occurrence.start !== undefined &&
      millis(occurrence.start) <= millis(now),
  );
}

export function civilDateOf(instant: string, timeZone: string): string {
  return Temporal.Instant.from(instant).toZonedDateTimeISO(timeZone).toPlainDate().toString();
}

function expandSeries(
  snapshot: Snapshot,
  series: SeriesRow,
  dates: string[],
): ExpandedOccurrence[] {
  const absent = new Set(
    snapshot.absences.filter((row) => row.seriesId === series.id).map((row) => row.civilDate),
  );
  const detachedDates = new Set(
    snapshot.detached
      .filter((row) => row.seriesId === series.id)
      .map((row) => civilDateOf(row.originalStart, snapshot.timeZone)),
  );
  const freezes = snapshot.freezes.filter((row) => row.seriesId === series.id);
  const emitted = new Set<string>();
  const occurrences: ExpandedOccurrence[] = [];
  for (const date of dates) {
    if (date < series.anchorDate || !matches(series, date)) {
      continue;
    }
    if (absent.has(date) || detachedDates.has(date)) {
      continue;
    }
    const freeze = freezes.find(
      (row) => civilDateOf(row.originalStart, snapshot.timeZone) === date,
    );
    if (freeze !== undefined) {
      occurrences.push(
        scheduled(
          series,
          civilDateOf(freeze.start, snapshot.timeZone),
          freeze.start,
          freeze.end,
          freeze.originalStart,
        ),
      );
      emitted.add(freeze.originalStart);
      continue;
    }
    if (skipped(snapshot, series.id, date)) {
      occurrences.push(bare(series, 'skipped', date));
      continue;
    }
    const choice = snapshot.choices.find(
      (row) => row.seriesId === series.id && row.civilDate === date,
    );
    if (choice !== undefined && choice.chosen === null) {
      occurrences.push({
        ...bare(series, 'choice_required', date),
        instants: [choice.earlier, choice.later],
      });
      continue;
    }
    if (choice?.chosen !== undefined && choice.chosen !== null) {
      const end = chosenEnd(choice.chosen, series);
      occurrences.push(scheduled(series, date, choice.chosen, end, choice.earlier));
      continue;
    }
    const resolved = resolveTemplate(snapshot.timeZone, date, series);
    if (resolved === undefined) {
      continue;
    }
    occurrences.push(scheduled(series, date, resolved.start, resolved.end, resolved.start));
  }
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  for (const freeze of freezes) {
    if (emitted.has(freeze.originalStart) || firstDate === undefined || lastDate === undefined) {
      continue;
    }
    const date = civilDateOf(freeze.start, snapshot.timeZone);
    const originalDate = civilDateOf(freeze.originalStart, snapshot.timeZone);
    if (
      absent.has(originalDate) ||
      detachedDates.has(originalDate) ||
      date < firstDate ||
      date > lastDate
    ) {
      continue;
    }
    occurrences.push(scheduled(series, date, freeze.start, freeze.end, freeze.originalStart));
  }
  return occurrences;
}

function scheduled(
  series: SeriesRow,
  date: string,
  start: string,
  end: string,
  originalStart: string,
): ExpandedOccurrence {
  return {
    ...bare(series, 'scheduled', date),
    start: stamp(start),
    end: stamp(end),
    originalStart: stamp(originalStart),
  };
}

function bare(
  series: SeriesRow,
  state: ExpandedOccurrence['state'],
  date: string,
): ExpandedOccurrence {
  return {
    id: series.id,
    state,
    visibility: series.visibility,
    title: series.title,
    location: series.location,
    description: series.description,
    date,
  };
}

function skipped(snapshot: Snapshot, seriesId: string, date: string): boolean {
  return snapshot.skips
    .filter((row) => row.seriesId === seriesId)
    .some((row) => ruleSkips(row, date));
}

function ruleSkips(rule: SkipRow, date: string): boolean {
  const start = clockOn(date, rule.localStart);
  const end = clockOn(date, rule.localEnd);
  if (start === undefined || end === undefined) {
    return false;
  }
  const resolvedStart = resolveLocalClock(rule.timeZone, start);
  const resolvedEnd = resolveLocalClock(rule.timeZone, end);
  if (resolvedStart.outcome === 'missing' || resolvedEnd.outcome === 'missing') {
    return true;
  }
  if (resolvedStart.outcome !== 'instant' || resolvedEnd.outcome !== 'instant') {
    return false;
  }
  const absolute =
    Temporal.Instant.from(resolvedEnd.instant).epochMilliseconds -
    Temporal.Instant.from(resolvedStart.instant).epochMilliseconds;
  const civil = (minutes(end) - minutes(start)) * 60_000;
  return civil > 0 && absolute < civil;
}

function resolveTemplate(
  timeZone: string,
  date: string,
  series: SeriesRow,
): { start: string; end: string } | undefined {
  const start = clockOn(date, series.localStart);
  const end = clockOn(date, series.localEnd);
  if (start === undefined || end === undefined) {
    return undefined;
  }
  const resolvedStart = resolveLocalClock(timeZone, start);
  const resolvedEnd = resolveLocalClock(timeZone, end);
  if (resolvedStart.outcome !== 'instant' || resolvedEnd.outcome !== 'instant') {
    return undefined;
  }
  return { start: resolvedStart.instant, end: resolvedEnd.instant };
}

function chosenEnd(chosen: string, series: SeriesRow): string {
  const start = clockParts(series.localStart);
  const end = clockParts(series.localEnd);
  const duration =
    ((end?.hour ?? 0) * 60 +
      (end?.minute ?? 0) -
      ((start?.hour ?? 0) * 60 + (start?.minute ?? 0))) *
    60_000;
  return new Date(new Date(chosen).getTime() + duration).toISOString();
}

function matches(series: SeriesRow, date: string): boolean {
  const plain = Temporal.PlainDate.from(date);
  if (series.repetition === 'daily') {
    return true;
  }
  if (series.repetition === 'weekly') {
    return plain.dayOfWeek === series.weekday;
  }
  return plain.day === series.monthDay;
}

function scheduledIntervals(occurrences: ExpandedOccurrence[]): Interval[] {
  return occurrences.flatMap((occurrence) =>
    occurrence.state === 'scheduled' &&
    occurrence.start !== undefined &&
    occurrence.end !== undefined
      ? [{ title: occurrence.title, start: occurrence.start, end: occurrence.end }]
      : [],
  );
}

function overlaps(
  saved: Interval,
  other: Interval,
  bounds: { start: number; end: number },
): boolean {
  const sharedStart = Math.max(millis(saved.start), millis(other.start), bounds.start);
  const sharedEnd = Math.min(millis(saved.end), millis(other.end), bounds.end);
  return sharedStart < sharedEnd;
}

function windowBounds(
  timeZone: string,
  first: string,
  last: string,
): { start: number; end: number } {
  const midnight = new Temporal.PlainTime(0, 0);
  const start = Temporal.PlainDate.from(first)
    .toZonedDateTime({ timeZone, plainTime: midnight })
    .toInstant().epochMilliseconds;
  const end = Temporal.PlainDate.from(last)
    .add({ days: 1 })
    .toZonedDateTime({ timeZone, plainTime: midnight })
    .toInstant().epochMilliseconds;
  return { start, end };
}

function eachDate(from: string, to: string): string[] {
  const dates: string[] = [];
  let cursor = Temporal.PlainDate.from(from);
  const end = Temporal.PlainDate.from(to);
  while (Temporal.PlainDate.compare(cursor, end) <= 0) {
    dates.push(cursor.toString());
    cursor = cursor.add({ days: 1 });
  }
  return dates;
}

function clockOn(date: string, clock: string): CivilClock | undefined {
  const parts = clockParts(clock);
  const plain = plainDate(date);
  if (parts === undefined) {
    return undefined;
  }
  return { ...plain, hour: parts.hour, minute: parts.minute };
}

function clockParts(clock: string): { hour: number; minute: number } | undefined {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(clock);
  if (match === null) {
    return undefined;
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function plainDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year: year ?? 0, month: month ?? 0, day: day ?? 0 };
}

function minutes(clock: CivilClock): number {
  return clock.hour * 60 + clock.minute;
}

function millis(instant: string): number {
  return Temporal.Instant.from(instant).epochMilliseconds;
}

function stamp(instant: string): string {
  return new Date(instant).toISOString();
}

function compareOccurrences(left: ExpandedOccurrence, right: ExpandedOccurrence): number {
  const date = left.date.localeCompare(right.date);
  if (date !== 0) {
    return date;
  }
  const start = (left.start ?? '9').localeCompare(right.start ?? '9');
  if (start !== 0) {
    return start;
  }
  return left.id.localeCompare(right.id);
}

async function loadFacts(
  client: PoolClient,
  seriesIds: string[],
): Promise<Pick<Snapshot, 'freezes' | 'absences' | 'skips' | 'choices'>> {
  if (seriesIds.length === 0) {
    return { freezes: [], absences: [], skips: [], choices: [] };
  }
  const freezes = await client.query<{
    series_event_id: string;
    original_start_instant: Date;
    start_instant: Date;
    end_instant: Date;
  }>(
    `SELECT series_event_id, original_start_instant, start_instant, end_instant
     FROM series_freezes WHERE series_event_id = ANY($1::uuid[])`,
    [seriesIds],
  );
  const absences = await client.query<{ series_event_id: string; civil_date: string }>(
    `SELECT series_event_id, civil_date::text
     FROM series_absences WHERE series_event_id = ANY($1::uuid[])`,
    [seriesIds],
  );
  const skips = await client.query<{
    series_event_id: string;
    timezone: string;
    local_start: string;
    local_end: string;
  }>(
    `SELECT series_event_id, timezone, local_start::text, local_end::text
     FROM series_skip_rules WHERE series_event_id = ANY($1::uuid[])`,
    [seriesIds],
  );
  const choices = await client.query<{
    series_event_id: string;
    civil_date: string;
    earlier_instant: Date;
    later_instant: Date;
    chosen_instant: Date | null;
  }>(
    `SELECT series_event_id, civil_date::text, earlier_instant, later_instant, chosen_instant
     FROM series_choices WHERE series_event_id = ANY($1::uuid[])`,
    [seriesIds],
  );
  return {
    freezes: freezes.rows.map((row) => ({
      seriesId: row.series_event_id,
      originalStart: row.original_start_instant.toISOString(),
      start: row.start_instant.toISOString(),
      end: row.end_instant.toISOString(),
    })),
    absences: absences.rows.map((row) => ({
      seriesId: row.series_event_id,
      civilDate: row.civil_date,
    })),
    skips: skips.rows.map((row) => ({
      seriesId: row.series_event_id,
      timeZone: row.timezone,
      localStart: row.local_start,
      localEnd: row.local_end,
    })),
    choices: choices.rows.map((row) => ({
      seriesId: row.series_event_id,
      civilDate: row.civil_date,
      earlier: row.earlier_instant.toISOString(),
      later: row.later_instant.toISOString(),
      chosen: row.chosen_instant?.toISOString() ?? null,
    })),
  };
}
