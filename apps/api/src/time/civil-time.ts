import { Temporal } from '@js-temporal/polyfill';

export type CivilDate = { year: number; month: number; day: number };

export type CivilClock = CivilDate & { hour: number; minute: number };

export type ClockResolution =
  | { outcome: 'instant'; instant: string }
  | { outcome: 'missing' }
  | { outcome: 'twice'; earlier: string; later: string }
  | { outcome: 'unresolved' };

export function resolveTimeZone(name: string): boolean {
  try {
    Temporal.Now.zonedDateTimeISO(name);
    return true;
  } catch {
    return false;
  }
}

export function resolveLocalClock(zone: string, clock: CivilClock): ClockResolution {
  if (!resolveTimeZone(zone)) {
    return { outcome: 'unresolved' };
  }
  let plain: Temporal.PlainDateTime;
  try {
    plain = Temporal.PlainDateTime.from(
      { ...clock, second: 0, millisecond: 0 },
      { overflow: 'reject' },
    );
  } catch {
    return { outcome: 'missing' };
  }
  try {
    const zoned = plain.toZonedDateTime(zone, { disambiguation: 'reject' });
    return { outcome: 'instant', instant: zoned.toInstant().toString() };
  } catch {
    const earlier = zonedOrUndefined(plain, zone, 'earlier');
    const later = zonedOrUndefined(plain, zone, 'later');
    if (
      earlier !== undefined &&
      later !== undefined &&
      sameClock(earlier, clock) &&
      sameClock(later, clock) &&
      earlier.epochMilliseconds !== later.epochMilliseconds
    ) {
      return {
        outcome: 'twice',
        earlier: earlier.toInstant().toString(),
        later: later.toInstant().toString(),
      };
    }
    return { outcome: 'missing' };
  }
}

export function calendarWindow(zone: string, start: CivilDate, count = 90): string[] | undefined {
  if (!resolveTimeZone(zone)) {
    return undefined;
  }
  let first: Temporal.PlainDate;
  try {
    first = Temporal.PlainDate.from(start, { overflow: 'reject' });
  } catch {
    return undefined;
  }
  const dates: string[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    dates.push(first.add({ days: offset }).toString());
  }
  return dates;
}

function zonedOrUndefined(
  plain: Temporal.PlainDateTime,
  zone: string,
  disambiguation: 'earlier' | 'later',
): Temporal.ZonedDateTime | undefined {
  try {
    return plain.toZonedDateTime(zone, { disambiguation });
  } catch {
    return undefined;
  }
}

function sameClock(zoned: Temporal.ZonedDateTime, clock: CivilClock): boolean {
  return (
    zoned.year === clock.year &&
    zoned.month === clock.month &&
    zoned.day === clock.day &&
    zoned.hour === clock.hour &&
    zoned.minute === clock.minute
  );
}
