import { Temporal } from '@js-temporal/polyfill';
import type {
  CivilTime,
  ConvertResult,
  LabelPort,
  Occurrence,
  TimePort,
} from '../../domain/time.js';

export function createTemporalPort(): TimePort & LabelPort {
  return {
    convert(zone, civil, occurrence) {
      return convert(zone, civil, occurrence);
    },
    offsetAt(zone, instant) {
      return Temporal.Instant.from(instant).toZonedDateTimeISO(zone).offset;
    },
  };
}

function convert(zone: string, civil: CivilTime, occurrence?: Occurrence): ConvertResult {
  let plain: Temporal.PlainDateTime;
  try {
    plain = Temporal.PlainDateTime.from(
      {
        year: civil.year,
        month: civil.month,
        day: civil.day,
        hour: civil.hour,
        minute: civil.minute,
        second: 0,
        millisecond: 0,
      },
      { overflow: 'reject' },
    );
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  try {
    const zoned = plain.toZonedDateTime(zone, { disambiguation: occurrence ?? 'reject' });
    if (occurrence !== undefined && !sameCivil(zoned, civil))
      return { ok: false, reason: 'nonexistent' };
    return { ok: true, instant: instantOf(zoned) };
  } catch (error) {
    const earlier = zonedOrUndefined(plain, zone, 'earlier');
    const later = zonedOrUndefined(plain, zone, 'later');
    if (
      earlier !== undefined &&
      later !== undefined &&
      sameCivil(earlier, civil) &&
      sameCivil(later, civil)
    ) {
      return { ok: false, reason: 'ambiguous' };
    }
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('time zone') || message.includes('timezone'))
      return { ok: false, reason: 'invalid' };
    return { ok: false, reason: 'nonexistent' };
  }
}

function zonedOrUndefined(
  plain: Temporal.PlainDateTime,
  zone: string,
  occurrence: Occurrence,
): Temporal.ZonedDateTime | undefined {
  try {
    return plain.toZonedDateTime(zone, { disambiguation: occurrence });
  } catch {
    return undefined;
  }
}

function sameCivil(zoned: Temporal.ZonedDateTime, civil: CivilTime): boolean {
  return (
    zoned.year === civil.year &&
    zoned.month === civil.month &&
    zoned.day === civil.day &&
    zoned.hour === civil.hour &&
    zoned.minute === civil.minute
  );
}

function instantOf(zoned: Temporal.ZonedDateTime): string {
  return zoned.toInstant().toString({ fractionalSecondDigits: 3 });
}
