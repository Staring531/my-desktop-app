import { Temporal } from '@js-temporal/polyfill';
import type { PoolClient } from 'pg';
import { resolveLocalClock, type CivilClock } from '../time/civil-time';

type GeneratedInput = {
  seriesId: string;
  timeZone: string;
  repetition: 'daily' | 'weekly' | 'monthly';
  anchorDate: string;
  localStart: string;
  localEnd: string;
  weekday: number | null;
  monthDay: number | null;
};

export async function recordGeneratedTimes(
  client: PoolClient,
  input: GeneratedInput,
): Promise<void> {
  const startParts = clockParts(input.localStart);
  const endParts = clockParts(input.localEnd);
  if (startParts === undefined || endParts === undefined) {
    return;
  }
  let skip = false;
  const choices: Array<{ date: string; earlier: string; later: string }> = [];
  for (const date of occurrenceDates(input)) {
    const startClock = onDate(date, startParts);
    const endClock = onDate(date, endParts);
    const start = resolveLocalClock(input.timeZone, startClock);
    const end = resolveLocalClock(input.timeZone, endClock);
    if (start.outcome === 'missing' || end.outcome === 'missing') {
      skip = true;
    } else if (start.outcome === 'instant' && end.outcome === 'instant') {
      const absolute =
        Temporal.Instant.from(end.instant).epochMilliseconds -
        Temporal.Instant.from(start.instant).epochMilliseconds;
      const civil = (minutes(endClock) - minutes(startClock)) * 60_000;
      if (civil > 0 && absolute < civil) {
        skip = true;
      }
    }
    if (start.outcome === 'twice') {
      choices.push({
        date,
        earlier: new Date(start.earlier).toISOString(),
        later: new Date(start.later).toISOString(),
      });
    }
  }
  if (skip) {
    await client.query(
      `INSERT INTO series_skip_rules (series_event_id, timezone, local_start, local_end)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [input.seriesId, input.timeZone, input.localStart, input.localEnd],
    );
  }
  if (choices.length === 0) {
    return;
  }
  await client.query(
    `INSERT INTO series_choices (series_event_id, civil_date, earlier_instant, later_instant)
     SELECT $1, civil_date, earlier_instant, later_instant
     FROM unnest($2::date[], $3::timestamptz[], $4::timestamptz[])
       AS found(civil_date, earlier_instant, later_instant)
     ON CONFLICT DO NOTHING`,
    [
      input.seriesId,
      choices.map((row) => row.date),
      choices.map((row) => row.earlier),
      choices.map((row) => row.later),
    ],
  );
}

function occurrenceDates(input: GeneratedInput): string[] {
  const anchor = Temporal.PlainDate.from(input.anchorDate);
  if (input.repetition === 'monthly' && input.monthDay !== null) {
    const dates: string[] = [];
    for (let offset = 0; offset < 12; offset += 1) {
      const month = anchor.add({ months: offset });
      dates.push(
        Temporal.PlainDate.from({
          year: month.year,
          month: month.month,
          day: input.monthDay,
        }).toString(),
      );
    }
    return dates.filter((date) => date >= input.anchorDate);
  }
  const dates: string[] = [];
  for (let offset = 0; offset < 366; offset += 1) {
    const date = anchor.add({ days: offset });
    if (input.repetition === 'weekly' && date.dayOfWeek !== input.weekday) {
      continue;
    }
    dates.push(date.toString());
  }
  return dates;
}

function clockParts(clock: string): { hour: number; minute: number } | undefined {
  const match = /^(\d{2}):(\d{2})/.exec(clock);
  if (match === null) {
    return undefined;
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function onDate(date: string, parts: { hour: number; minute: number }): CivilClock {
  const [year, month, day] = date.split('-').map(Number);
  return {
    year: year ?? 0,
    month: month ?? 0,
    day: day ?? 0,
    hour: parts.hour,
    minute: parts.minute,
  };
}

function minutes(clock: CivilClock): number {
  return clock.hour * 60 + clock.minute;
}
