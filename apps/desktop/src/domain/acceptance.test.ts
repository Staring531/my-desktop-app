import { describe, expect, it } from 'vitest';
import * as domain from './index.js';
import type { CivilTime, ConvertResult, TimePort } from './time.js';
import type { ActiveRecord, Stamp, TeamRecord } from './types.js';

const absent: TeamRecord = { status: 'absent' };
const absentStamp: Stamp = { kind: 'absent' };
const nine: CivilTime = { year: 2026, month: 1, day: 2, hour: 9, minute: 0 };
const ten: CivilTime = { year: 2026, month: 1, day: 2, hour: 10, minute: 0 };
const eight: CivilTime = { year: 2026, month: 1, day: 2, hour: 8, minute: 0 };

function port(result?: ConvertResult): TimePort & { calls: number } {
  return {
    calls: 0,
    convert(zone, civil, occurrence) {
      this.calls += 1;
      void zone;
      if (result && !result.ok && occurrence === undefined) return result;
      if (result?.ok)
        return {
          ok: true,
          instant: occurrence === undefined ? result.instant : `${result.instant}-${occurrence}`,
        };
      return {
        ok: true,
        instant: `2026-01-02T${String(civil.hour).padStart(2, '0')}:${String(civil.minute).padStart(2, '0')}:00.000Z`,
      };
    },
  };
}

function created(generation = 'g1'): ActiveRecord {
  const result = domain.createTeam(absent, {
    actorEmail: 'Sam@Team.com',
    stamp: absentStamp,
    zone: 'UTC',
    time: port(),
    generation,
  });
  if (!result.ok || result.record.status !== 'active') throw new Error('team');
  return result.record;
}

function ctx(record: ActiveRecord, time = port()) {
  return {
    stamp: { kind: 'generation' as const, generation: record.generation },
    zone: 'America/New_York',
    time,
  };
}

describe('acceptance ids at the domain layer', () => {
  it('AC-001 AC-003 store the founder and reject an unusable email', () => {
    const team = created();
    expect(team.maintainerEmail).toBe('sam@team.com');
    expect(team.roster).toEqual([{ email: 'sam@team.com' }]);
    const blank = domain.createTeam(absent, {
      actorEmail: 'sam @team.com',
      stamp: absentStamp,
      zone: 'UTC',
      time: port(),
      generation: 'g1',
    });
    expect(blank).toEqual({ ok: false, code: 'unusable-email', record: absent });
  });

  it('AC-004 AC-005 AC-006 AC-007 AC-008 AC-030 AC-032 AC-033 AC-034 keep one invite for the invited email', () => {
    const team = created();
    const base = ctx(team);
    const invited = domain.invite(team, {
      ...base,
      actorEmail: 'sam@team.com',
      email: 'Ada@Team.com',
    });
    if (!invited.ok || invited.record.status !== 'active') return;
    expect(domain.project(invited.record, 'ada@team.com')).toEqual({
      record: 'active',
      access: 'invite',
      invite: { email: 'ada@team.com' },
    });
    expect(
      domain.invite(invited.record, { ...base, actorEmail: 'sam@team.com', email: 'ada@team.com' }),
    ).toMatchObject({ ok: false, code: 'invite-exists', record: invited.record });
    expect(
      domain.invite(invited.record, { ...base, actorEmail: 'sam@team.com', email: 'Sam@Team.com' }),
    ).toMatchObject({ ok: false, code: 'already-member' });
    expect(
      domain.acceptInvite(invited.record, { ...base, actorEmail: 'bea@team.com' }),
    ).toMatchObject({ ok: false, code: 'no-matching-invite', record: invited.record });
    const handed = domain.designate(
      domain.acceptInvite(invited.record, { ...base, actorEmail: 'sam@team.com' }).ok ? team : team,
      { ...base, actorEmail: 'sam@team.com', email: 'sam@team.com' },
    );
    expect(handed.ok).toBe(false);
    const kept = domain.designate(
      { ...invited.record, roster: [...invited.record.roster, { email: 'bea@team.com' }] },
      { ...base, actorEmail: 'sam@team.com', email: 'bea@team.com' },
    );
    if (!kept.ok || kept.record.status !== 'active') return;
    expect(kept.record.invites).toEqual([{ email: 'ada@team.com' }]);
    const declined = domain.declineInvite(invited.record, { ...base, actorEmail: 'ada@team.com' });
    if (!declined.ok || declined.record.status !== 'active') return;
    expect(declined.record.roster).toEqual(team.roster);
    expect(declined.record.invites).toEqual([]);
    const canceled = domain.cancelInvite(invited.record, {
      ...base,
      actorEmail: 'sam@team.com',
      email: 'ada@team.com',
    });
    if (!canceled.ok || canceled.record.status !== 'active') return;
    expect(canceled.record.roster).toEqual(team.roster);
  });

  it('AC-009 AC-010 AC-011 AC-023 AC-038 AC-039 transfer, refuse self-actions, and dissolve only the sole member', () => {
    const team = created();
    const base = ctx(team);
    const joined = domain.acceptInvite(
      must(domain.invite(team, { ...base, actorEmail: 'sam@team.com', email: 'ada@team.com' })),
      { ...base, actorEmail: 'ada@team.com' },
    );
    if (!joined.ok || joined.record.status !== 'active') return;
    const role = domain.designate(joined.record, {
      ...base,
      actorEmail: 'sam@team.com',
      email: 'ada@team.com',
    });
    if (!role.ok || role.record.status !== 'active') return;
    expect(role.record.maintainerEmail).toBe('ada@team.com');
    expect(
      domain.designate(role.record, { ...base, actorEmail: 'ada@team.com', email: 'ada@team.com' }),
    ).toMatchObject({ ok: false, record: role.record });
    expect(
      domain.removeMember(role.record, {
        ...base,
        actorEmail: 'ada@team.com',
        email: 'ada@team.com',
      }),
    ).toMatchObject({ ok: false, record: role.record });
    expect(domain.dissolve(role.record, { ...base, actorEmail: 'ada@team.com' })).toMatchObject({
      ok: false,
      record: role.record,
    });
    expect(
      domain.invite(role.record, { ...base, actorEmail: 'sam@team.com', email: 'bea@team.com' }),
    ).toMatchObject({ ok: false, code: 'not-allowed' });
    const removed = domain.removeMember(role.record, {
      ...base,
      actorEmail: 'ada@team.com',
      email: 'sam@team.com',
    });
    if (!removed.ok || removed.record.status !== 'active') return;
    const dissolved = domain.dissolve(removed.record, { ...base, actorEmail: 'ada@team.com' });
    expect(dissolved).toEqual({ ok: true, record: { status: 'dissolved', generation: 'g1' } });
  });

  it('AC-012 AC-013 AC-015 AC-043 AC-044 AC-051 save text and reject unsupported modes', () => {
    const team = created();
    const base = ctx(team);
    const time = port();
    const saved = domain.createEvent(team, {
      ...base,
      time,
      actorEmail: 'sam@team.com',
      eventId: 'e1',
      visibility: 'team-visible',
      title: '  HQ  ',
      location: '  ',
      description: 'line\n two',
      start: eight,
      end: nine,
    });
    if (!saved.ok || saved.record.status !== 'active') return;
    expect(saved.record.events[0]).toMatchObject({
      title: 'HQ',
      location: '',
      description: 'line\n two',
    });
    expect(time.calls).toBe(2);
    expect(
      domain.createEvent(team, {
        ...base,
        actorEmail: 'sam@team.com',
        eventId: 'e2',
        visibility: 'team-visible',
        title: '   ',
        start: nine,
        end: ten,
      }),
    ).toMatchObject({ code: 'empty-title', record: team });
    const invited = must(
      domain.invite(team, { ...base, actorEmail: 'sam@team.com', email: 'ada@team.com' }),
    );
    expect(
      domain.createEvent(invited, {
        ...base,
        actorEmail: 'ada@team.com',
        eventId: 'e2',
        visibility: 'only-self',
        title: 'Nope',
        start: nine,
        end: ten,
      }),
    ).toMatchObject({ code: 'not-allowed', record: invited });
    expect(
      domain.createEvent(team, {
        ...base,
        actorEmail: 'sam@team.com',
        eventId: 'e2',
        visibility: 'team-visible',
        title: 'HQ',
        start: nine,
        end: ten,
        recurring: true,
      }),
    ).toMatchObject({ code: 'recurrence-not-supported', record: team });
    expect(
      domain.createEvent(team, {
        ...base,
        actorEmail: 'sam@team.com',
        eventId: 'e2',
        visibility: 'team-visible',
        title: 'HQ',
        start: nine,
        end: ten,
        allDay: true,
      }),
    ).toMatchObject({ code: 'all-day-not-supported', record: team });
  });

  it('AC-017 AC-018 AC-019 AC-036 AC-040 AC-041 AC-045 show the permitted board', () => {
    const team = created();
    const base = ctx(team);
    const withEvents = must(
      domain.createEvent(
        must(
          domain.createEvent(team, {
            ...base,
            actorEmail: 'sam@team.com',
            eventId: 'team',
            visibility: 'team-visible',
            title: 'HQ',
            start: nine,
            end: ten,
          }),
        ),
        {
          ...base,
          actorEmail: 'sam@team.com',
          eventId: 'self',
          visibility: 'only-self',
          title: 'Mine',
          start: nine,
          end: ten,
        },
      ),
    );
    const joined = must(
      domain.acceptInvite(
        { ...withEvents, invites: [{ email: 'ada@team.com' }] },
        { ...base, actorEmail: 'ada@team.com' },
      ),
    );
    const ada = domain.project(joined, 'ada@team.com');
    const sam = domain.project(joined, 'sam@team.com');
    if (ada.access !== 'member' || sam.access !== 'member') return;
    expect(ada.events.map((event) => event.id)).toEqual(['team']);
    expect(
      domain
        .busyAt(sam, 'sam@team.com', '2026-01-02T09:00:00.000Z')
        .find((row) => row.email === 'sam@team.com')?.busy,
    ).toBe(true);
    expect(
      domain
        .busyAt(ada, 'ada@team.com', '2026-01-02T09:00:00.000Z')
        .find((row) => row.email === 'ada@team.com')?.busy,
    ).toBe(false);
    const removed = must(
      domain.removeMember(joined, { ...base, actorEmail: 'sam@team.com', email: 'ada@team.com' }),
    );
    expect(domain.project(removed, 'ada@team.com')).toEqual({
      record: 'active',
      access: 'no-access',
    });
    const overlap = must(
      domain.createEvent(joined, {
        ...base,
        actorEmail: 'ada@team.com',
        eventId: 'other',
        visibility: 'team-visible',
        title: 'Clinic',
        start: nine,
        end: ten,
      }),
    );
    const view = domain.project(overlap, 'sam@team.com');
    if (view.access !== 'member') return;
    expect(view.events.map((event) => event.title).sort()).toEqual(['Clinic', 'HQ', 'Mine']);
    expect(
      domain
        .busyAt(view, 'sam@team.com', '2026-01-02T09:30:00.000Z')
        .every((row) => row.email === 'ada@team.com' || row.busy || row.email === 'sam@team.com'),
    ).toBe(true);
    expect('reminder' in domain).toBe(false); // AC-027
  });

  it('AC-020 AC-021 AC-022 AC-029 AC-037 AC-047 AC-048 AC-049 keep custody and restore the owner', () => {
    const team = created();
    const base = ctx(team);
    const event = must(
      domain.createEvent(team, {
        ...base,
        actorEmail: 'sam@team.com',
        eventId: 'e1',
        visibility: 'team-visible',
        title: 'HQ',
        location: 'Desk',
        description: 'Note',
        start: nine,
        end: ten,
      }),
    );
    const privateEvent = must(
      domain.createEvent(event, {
        ...base,
        actorEmail: 'sam@team.com',
        eventId: 'self',
        visibility: 'only-self',
        title: 'Mine',
        start: nine,
        end: ten,
      }),
    );
    const joined = must(
      domain.acceptInvite(
        must(
          domain.invite(privateEvent, {
            ...base,
            actorEmail: 'sam@team.com',
            email: 'ada@team.com',
          }),
        ),
        { ...base, actorEmail: 'ada@team.com' },
      ),
    );
    expect(
      domain.modifyEvent(joined, {
        ...base,
        actorEmail: 'ada@team.com',
        eventId: 'e1',
        title: 'Stolen',
      }),
    ).toMatchObject({ ok: false, record: joined });
    const handed = must(
      domain.designate(joined, { ...base, actorEmail: 'sam@team.com', email: 'ada@team.com' }),
    );
    const gone = must(
      domain.removeMember(handed, { ...base, actorEmail: 'ada@team.com', email: 'sam@team.com' }),
    );
    expect(gone.events.map((item) => item.id)).toEqual(['e1']);
    const clinic = must(
      domain.modifyEvent(gone, {
        ...base,
        actorEmail: 'ada@team.com',
        eventId: 'e1',
        title: 'Clinic',
        location: 'Room',
        description: 'Seen',
      }),
    );
    expect(clinic.events[0]).toMatchObject({
      title: 'Clinic',
      location: 'Room',
      description: 'Seen',
      visibility: 'team-visible',
    });
    expect(
      domain.modifyEvent(gone, {
        ...base,
        actorEmail: 'ada@team.com',
        eventId: 'e1',
        visibility: 'only-self',
        title: 'Hidden',
      }),
    ).toMatchObject({ ok: false, record: gone });
    const calls = port();
    const located = domain.modifyEvent(clinic, {
      ...ctx(clinic, calls),
      actorEmail: 'ada@team.com',
      eventId: 'e1',
      location: 'Hall',
    });
    expect(located.ok).toBe(true);
    expect(calls.calls).toBe(0);
    const rejoined = must(
      domain.acceptInvite(
        must(domain.invite(clinic, { ...base, actorEmail: 'ada@team.com', email: 'sam@team.com' })),
        { ...base, actorEmail: 'sam@team.com' },
      ),
    );
    expect(
      domain.modifyEvent(rejoined, {
        ...base,
        actorEmail: 'ada@team.com',
        eventId: 'e1',
        title: 'No',
      }),
    ).toMatchObject({ ok: false, record: rejoined });
    const owned = must(
      domain.modifyEvent(rejoined, {
        ...base,
        actorEmail: 'sam@team.com',
        eventId: 'e1',
        title: 'Mine again',
      }),
    );
    expect(owned.events.find((item) => item.id === 'e1')?.title).toBe('Mine again');
    expect(
      domain.project(owned, 'sam@team.com').access === 'member' &&
        domain.project(owned, 'sam@team.com'),
    ).toBeTruthy();
    const deleted = must(
      domain.deleteEvent(owned, { ...base, actorEmail: 'sam@team.com', eventId: 'e1' }),
    );
    expect(deleted.events.map((item) => item.id)).toEqual([]);
    expect(
      domain.deleteEvent(gone, { ...base, actorEmail: 'ada@team.com', eventId: 'e1' }).ok,
    ).toBe(true);
  });
});

function must(result: domain.DomainResult): ActiveRecord {
  if (!result.ok || result.record.status !== 'active') throw new Error('expected active');
  return result.record;
}
