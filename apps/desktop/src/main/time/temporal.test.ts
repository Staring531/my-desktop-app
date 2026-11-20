import { describe, expect, it } from 'vitest';
import { formatClockLabel } from '../../domain/time.js';
import { createTemporalPort } from './temporal.js';

describe('America/New_York adapter', () => {
  const port = createTemporalPort();

  it('AC-014 rejects the spring-forward gap, including an occurrence choice', () => {
    const civil = { year: 2026, month: 3, day: 8, hour: 2, minute: 30 };
    expect(port.convert('America/New_York', civil)).toEqual({ ok: false, reason: 'nonexistent' });
    expect(port.convert('America/New_York', civil, 'earlier')).toEqual({
      ok: false,
      reason: 'nonexistent',
    });
    expect(port.convert('America/New_York', civil, 'later')).toEqual({
      ok: false,
      reason: 'nonexistent',
    });
  });

  it('AC-028 returns both fall-back occurrences and rejects month 13', () => {
    const civil = { year: 2026, month: 11, day: 1, hour: 1, minute: 30 };
    expect(port.convert('America/New_York', civil)).toEqual({ ok: false, reason: 'ambiguous' });
    const earlier = port.convert('America/New_York', civil, 'earlier');
    const later = port.convert('America/New_York', civil, 'later');
    expect(earlier.ok && later.ok && earlier.instant !== later.instant).toBe(true);
  });

  it('AC-016 and AC-042 label January and July with different offsets', () => {
    expect(
      port.convert('America/New_York', { year: 2026, month: 13, day: 1, hour: 0, minute: 0 }),
    ).toEqual({
      ok: false,
      reason: 'invalid',
    });
    const january = '2026-01-15T17:00:00.000Z';
    const july = '2026-07-15T16:00:00.000Z';
    const winter = formatClockLabel('America/New_York', january, port);
    const summer = formatClockLabel('America/New_York', july, port);
    expect(winter).toContain('-05:00');
    expect(summer).toContain('-04:00');
    expect(winter).not.toBe(summer);
  });
});
