import { Temporal } from '@js-temporal/polyfill';
import { calendarWindow, type CivilClock, type CivilDate } from '../time/civil-time';

export type SeriesRepetition = 'daily' | 'weekly' | 'monthly';

export type SeriesTemplate = {
  title: string;
  location: string;
  description: string;
  visibility: 'public' | 'private';
  repetition: SeriesRepetition;
  localStart: string;
  localEnd: string;
  anchorDate: string;
  weekday: number | null;
  monthDay: number | null;
};

export type MonthlyPreview = { monthTypes: string[]; missingDates: string[] };

const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function parseSeries(
  body: unknown,
  zone: string,
  repetition: SeriesRepetition,
): { template: SeriesTemplate } | { preview: MonthlyPreview } | undefined {
  const fields = textFields(body);
  const clocks = clockPair(body);
  if (fields === undefined || clocks === undefined) {
    return undefined;
  }
  if (
    clocks.start.year !== clocks.end.year ||
    clocks.start.month !== clocks.end.month ||
    clocks.start.day !== clocks.end.day
  ) {
    return undefined;
  }
  if (minutes(clocks.start) >= minutes(clocks.end)) {
    return undefined;
  }
  const anchor = `${pad(clocks.start.year)}-${pad(clocks.start.month)}-${pad(clocks.start.day)}`;
  if (repetition === 'monthly' && clocks.start.day > 28) {
    const preview = monthlyPreview(zone, clocks.start, clocks.start.day);
    return preview === undefined ? undefined : { preview };
  }
  return {
    template: {
      ...fields,
      repetition,
      localStart: `${pad(clocks.start.hour)}:${pad(clocks.start.minute)}:00`,
      localEnd: `${pad(clocks.end.hour)}:${pad(clocks.end.minute)}:00`,
      anchorDate: anchor,
      weekday: repetition === 'weekly' ? weekday(clocks.start) : null,
      monthDay: repetition === 'monthly' ? clocks.start.day : null,
    },
  };
}

export function monthlyPreview(
  zone: string,
  anchor: CivilDate,
  day: number,
): MonthlyPreview | undefined {
  const monthTypes = monthNames.filter((_, index) => (monthLengths[index] ?? 31) < day);
  if (monthTypes.length === 0) {
    return undefined;
  }
  const window = calendarWindow(zone, anchor, 90);
  if (window === undefined) {
    return undefined;
  }
  const months = new Set(window.map((date) => date.slice(0, 7)));
  const missingDates: string[] = [];
  for (const month of months) {
    const [yearText, monthText] = month.split('-');
    const year = Number(yearText);
    const monthNumber = Number(monthText);
    if (!civilDateExists(year, monthNumber, day)) {
      missingDates.push(`${month}-${pad(day)}`);
    }
  }
  missingDates.sort();
  return { monthTypes, missingDates };
}

function textFields(
  body: unknown,
): Pick<SeriesTemplate, 'title' | 'location' | 'description' | 'visibility'> | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.title !== 'string' || record.title.trim() === '') {
    return undefined;
  }
  const visibility =
    record.visibility === 'public'
      ? 'public'
      : record.visibility === undefined || record.visibility === 'private'
        ? 'private'
        : undefined;
  if (visibility === undefined) {
    return undefined;
  }
  if (typeof record.location !== 'string' && record.location !== undefined) {
    return undefined;
  }
  if (typeof record.description !== 'string' && record.description !== undefined) {
    return undefined;
  }
  return {
    title: record.title.trim(),
    location: typeof record.location === 'string' ? record.location : '',
    description: typeof record.description === 'string' ? record.description : '',
    visibility,
  };
}

function clockPair(body: unknown): { start: CivilClock; end: CivilClock } | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  const start = enteredClock(record.start);
  const end = enteredClock(record.end);
  if (start === undefined || end === undefined) {
    return undefined;
  }
  return { start, end };
}

function enteredClock(value: unknown): CivilClock | undefined {
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
  const clock = {
    year: Number(date[1]),
    month: Number(date[2]),
    day: Number(date[3]),
    hour: Number(time[1]),
    minute: Number(time[2]),
  };
  try {
    Temporal.PlainDate.from(
      { year: clock.year, month: clock.month, day: clock.day },
      { overflow: 'reject' },
    );
  } catch {
    return undefined;
  }
  if (clock.hour > 23 || clock.minute > 59) {
    return undefined;
  }
  return clock;
}

function weekday(clock: CivilClock): number {
  return Temporal.PlainDate.from({ year: clock.year, month: clock.month, day: clock.day })
    .dayOfWeek;
}

function minutes(clock: CivilClock): number {
  return clock.hour * 60 + clock.minute;
}

function civilDateExists(year: number, month: number, day: number): boolean {
  try {
    Temporal.PlainDate.from({ year, month, day }, { overflow: 'reject' });
    return true;
  } catch {
    return false;
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
