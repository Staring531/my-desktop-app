import { describe, expect, it } from 'vitest';
import { calendarWindow, resolveLocalClock, resolveTimeZone } from './civil-time';

describe('IANA civil time', () => {
  it('resolves America/New_York and rejects an unknown name', () => {
    expect(resolveTimeZone('America/New_York')).toBe(true);
    expect(resolveTimeZone('Not/AZone')).toBe(false);
    expect(calendarWindow('Not/AZone', { year: 2026, month: 1, day: 1 })).toBeUndefined();
  });

  it('rejects 02:30 on 2026-03-08 in America/New_York', () => {
    expect(
      resolveLocalClock('America/New_York', {
        year: 2026,
        month: 3,
        day: 8,
        hour: 2,
        minute: 30,
      }),
    ).toEqual({ outcome: 'missing' });
  });

  it('returns two different instants for 01:30 on 2026-11-01 in America/New_York', () => {
    const resolved = resolveLocalClock('America/New_York', {
      year: 2026,
      month: 11,
      day: 1,
      hour: 1,
      minute: 30,
    });
    expect(resolved.outcome).toBe('twice');
    if (resolved.outcome !== 'twice') {
      return;
    }
    expect(resolved.earlier).not.toBe(resolved.later);
  });

  it('includes the start date and February 2026, and excludes day 91', () => {
    const dates = calendarWindow('America/New_York', { year: 2026, month: 1, day: 1 });
    expect(dates).toHaveLength(90);
    expect(dates?.[0]).toBe('2026-01-01');
    expect(dates).toContain('2026-02-01');
    expect(dates).toContain('2026-02-28');
    expect(dates).not.toContain('2026-04-01');
    expect(dates?.[89]).toBe('2026-03-31');
  });
});
