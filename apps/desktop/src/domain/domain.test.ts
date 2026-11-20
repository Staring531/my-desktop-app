import { describe, expect, it } from 'vitest';
import * as domain from './index.js';
import type { CivilTime, ConvertResult, TimePort } from './time.js';
import type { ActiveRecord, Stamp, TeamRecord } from './types.js';

const absent: TeamRecord = { status: 'absent' };
const absentStamp: Stamp = { kind: 'absent' };
const generation = (value: string): Stamp => ({ kind: 'generation', generation: value });

const nine: CivilTime = { year: 2026, month: 1, day: 2, hour: 9, minute: 0 };
const ten: CivilTime = { year: 2026, month: 1, day: 2, hour: 10, minute: 0 };
const eight: CivilTime = { year: 2026, month: 1, day: 2, hour: 8, minute: 0 };

function fixedPort(result?: ConvertResult): TimePort & { zones: string[] } {
  return {
    zones: [],
    convert(zone, civil, occurrence) {
      this.zones.push(zone);
      if (result && !result.ok) return result;
      if (result?.ok)
        return {
          ok: true,
          instant: occurrence === undefined ? result.instant : `${result.instant}-${occurrence}`,
        };
      const hour = String(civil.hour).padStart(2, '0');
      const minute = String(civil.minute).padStart(2, '0');
      return { ok: true, instant: `2026-01-02T${hour}:${minute}:00.000Z` };
    },
  };
}

function team(generationId = 'g1'): ActiveRecord {
  const created = domain.createTeam(absent, {
    actorEmail: 'Sam@Team.com',
    stamp: absentStamp,
    zone: 'UTC',
    time: fixedPort(),
    generation: generationId,
  });
  if (!created.ok || created.record.status !== 'active') throw new Error('fixture');
  return created.record;
}

function base(record: ActiveRecord) {
  return {
    stamp: generation(record.generation),
    zone: 'America/New_York',
    time: fixedPort(),
  };
}

describe('canonicalize', () => {
  it('lowercases a usable email and rejects unusable ones', () => {
    expect(domain.canonicalize('Sam@Team.com')).toEqual({ ok: true, email: 'sam@team.com' });
    expect(domain.canonicalize('sam @team.com').ok).toBe(false);
    expect(domain.canonicalize('   ').ok).toBe(false);
    expect(domain.canonicalize('samteam.com').ok).toBe(false);
    expect(domain.canonicalize('a@b@c.com').ok).toBe(false);
    expect(domain.canonicalize('sam@te am.com').ok).toBe(false);
    expect(domain.canonicalize('Sam@Team.com')).toEqual(domain.canonicalize('sam@team.com'));
  });
});

describe('invariants', () => {
  it('accepts absent, dissolved, and a valid active record', () => {
    expect(domain.checkInvariants(absent)).toEqual({ ok: true });
    expect(domain.checkInvariants({ status: 'dissolved', generation: 'g1' })).toEqual({ ok: true });
    expect(domain.checkInvariants(team()).ok).toBe(true);
  });

  it('reports each broken active invariant', () => {
    const active = team();
    expect(domain.checkInvariants({ ...active, maintainerEmail: 'other@team.com' }).ok).toBe(false);
    expect(
      domain.checkInvariants({ ...active, roster: [...active.roster, { email: 'sam@team.com' }] })
        .ok,
    ).toBe(false);
    expect(
      domain.checkInvariants({
        ...active,
        invites: [{ email: 'a@team.com' }, { email: 'a@team.com' }],
      }).ok,
    ).toBe(false);
    expect(domain.checkInvariants({ ...active, invites: [{ email: 'sam@team.com' }] }).ok).toBe(
      false,
    );
    expect(
      domain.checkInvariants({
        ...active,
        events: [
          {
            id: '',
            ownerEmail: 'sam@team.com',
            visibility: 'team-visible',
            title: 'HQ',
            location: '',
            description: '',
            start: 'a',
            end: 'b',
          },
        ],
      }).ok,
    ).toBe(false);
  });
});

describe('createTeam', () => {
  it('stores the canonical founder and rejects a bad email, an active team, and an empty generation', () => {
    const created = domain.createTeam(absent, {
      actorEmail: 'Sam@Team.com',
      stamp: absentStamp,
      zone: 'UTC',
      time: fixedPort(),
      generation: 'g1',
    });
    expect(created.ok).toBe(true);
    if (!created.ok || created.record.status !== 'active') return;
    expect(created.record.maintainerEmail).toBe('sam@team.com');
    expect(created.record.roster).toEqual([{ email: 'sam@team.com' }]);
    expect(created.record.invites).toEqual([]);
    expect(created.record.events).toEqual([]);

    const blank = domain.createTeam(absent, {
      actorEmail: 'sam @team.com',
      stamp: absentStamp,
      zone: 'UTC',
      time: fixedPort(),
      generation: 'g1',
    });
    expect(blank).toEqual({ ok: false, code: 'unusable-email', record: absent });

    const active = created.record;
    const again = domain.createTeam(active, {
      actorEmail: 'ada@team.com',
      stamp: generation('g1'),
      zone: 'UTC',
      time: fixedPort(),
      generation: 'g2',
    });
    expect(again).toEqual({ ok: false, code: 'team-already-active', record: active });

    const dissolved: TeamRecord = { status: 'dissolved', generation: 'g1' };
    const empty = domain.createTeam(dissolved, {
      actorEmail: 'ada@team.com',
      stamp: generation('g1'),
      zone: 'UTC',
      time: fixedPort(),
      generation: '',
    });
    expect(empty.ok).toBe(false);
    if (empty.ok) return;
    expect(empty.record).toBe(dissolved);

    const next = domain.createTeam(dissolved, {
      actorEmail: 'Ada@Team.com',
      stamp: generation('g1'),
      zone: 'UTC',
      time: fixedPort(),
      generation: 'g2',
    });
    expect(next.ok).toBe(true);
    if (!next.ok || next.record.status !== 'active') return;
    expect(next.record.generation).toBe('g2');
    expect(next.record.events).toEqual([]);
  });
});

describe('invites and membership', () => {
  it('covers invite, succession, removal, and dissolution', () => {
    const active = team();
    const context = base(active);
    const invited = domain.invite(active, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'Ada@Team.com',
    });
    expect(invited.ok).toBe(true);
    if (!invited.ok || invited.record.status !== 'active') return;
    expect(invited.record.invites).toEqual([{ email: 'ada@team.com' }]);

    const memberAgain = domain.invite(invited.record, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'Sam@Team.com',
    });
    expect(memberAgain).toMatchObject({
      ok: false,
      code: 'already-member',
      record: invited.record,
    });
    const second = domain.invite(invited.record, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'ada@team.com',
    });
    expect(second).toMatchObject({ ok: false, code: 'invite-exists', record: invited.record });

    const stranger = domain.acceptInvite(invited.record, {
      ...context,
      actorEmail: 'bea@team.com',
    });
    expect(stranger).toMatchObject({
      ok: false,
      code: 'no-matching-invite',
      record: invited.record,
    });

    const joined = domain.acceptInvite(invited.record, { ...context, actorEmail: 'ada@team.com' });
    expect(joined.ok).toBe(true);
    if (!joined.ok || joined.record.status !== 'active') return;
    expect(joined.record.maintainerEmail).toBe('sam@team.com');
    expect(joined.record.invites).toEqual([]);
    expect(joined.record.roster.map((entry) => entry.email)).toEqual([
      'sam@team.com',
      'ada@team.com',
    ]);

    const role = domain.designate(joined.record, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'ada@team.com',
    });
    expect(role.ok).toBe(true);
    if (!role.ok || role.record.status !== 'active') return;
    expect(role.record.maintainerEmail).toBe('ada@team.com');
    expect(role.record.roster).toHaveLength(2);
    const self = domain.designate(role.record, {
      ...context,
      actorEmail: 'ada@team.com',
      email: 'ada@team.com',
    });
    expect(self).toMatchObject({ ok: false, record: role.record });

    const withPrivate = {
      ...role.record,
      events: [
        {
          id: 'e1',
          ownerEmail: 'sam@team.com',
          visibility: 'only-self' as const,
          title: 'Private',
          location: '',
          description: '',
          start: '2026-01-02T09:00:00.000Z',
          end: '2026-01-02T10:00:00.000Z',
        },
        {
          id: 'e2',
          ownerEmail: 'sam@team.com',
          visibility: 'team-visible' as const,
          title: 'HQ',
          location: '',
          description: '',
          start: '2026-01-02T09:00:00.000Z',
          end: '2026-01-02T10:00:00.000Z',
        },
      ],
    };
    const removed = domain.removeMember(withPrivate, {
      ...context,
      actorEmail: 'ada@team.com',
      email: 'sam@team.com',
    });
    expect(removed.ok).toBe(true);
    if (!removed.ok || removed.record.status !== 'active') return;
    expect(removed.record.roster).toEqual([{ email: 'ada@team.com' }]);
    expect(removed.record.events.map((event) => event.id)).toEqual(['e2']);
    const selfRemove = domain.removeMember(role.record, {
      ...context,
      actorEmail: 'ada@team.com',
      email: 'ada@team.com',
    });
    expect(selfRemove).toMatchObject({ ok: false, record: role.record });
    const ordinary = domain.invite(role.record, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'bea@team.com',
    });
    expect(ordinary).toMatchObject({ ok: false, code: 'not-allowed', record: role.record });

    const tooMany = domain.dissolve(role.record, { ...context, actorEmail: 'ada@team.com' });
    expect(tooMany).toMatchObject({ ok: false, record: role.record });
    const sole = domain.dissolve(removed.record, { ...context, actorEmail: 'ada@team.com' });
    expect(sole.ok).toBe(true);
    if (!sole.ok) return;
    expect(sole.record).toEqual({ status: 'dissolved', generation: 'g1' });
  });
});

describe('events', () => {
  it('creates, rejects bad times, and preserves custody rules', () => {
    const active = team();
    const context = base(active);
    const port = fixedPort();
    const created = domain.createEvent(active, {
      ...context,
      time: port,
      actorEmail: 'sam@team.com',
      eventId: 'e1',
      visibility: 'team-visible',
      title: '  HQ  ',
      location: '   ',
      description: 'line\n two',
      start: nine,
      end: ten,
    });
    expect(created.ok).toBe(true);
    if (!created.ok || created.record.status !== 'active') return;
    expect(created.record.events[0]).toMatchObject({
      id: 'e1',
      ownerEmail: 'sam@team.com',
      title: 'HQ',
      location: '',
      description: 'line\n two',
      visibility: 'team-visible',
    });
    expect(port.zones).toEqual(['America/New_York', 'America/New_York']);
    const stored = created.record.events[0];
    expect(stored !== undefined && stored.end > stored.start).toBe(true);

    const emptyTitle = domain.createEvent(active, {
      ...context,
      actorEmail: 'sam@team.com',
      eventId: 'e2',
      visibility: 'team-visible',
      title: '   ',
      start: nine,
      end: ten,
    });
    expect(emptyTitle).toMatchObject({ ok: false, code: 'empty-title', record: active });
    const order = domain.createEvent(active, {
      ...context,
      actorEmail: 'sam@team.com',
      eventId: 'e2',
      visibility: 'team-visible',
      title: 'HQ',
      start: ten,
      end: nine,
    });
    expect(order).toMatchObject({ ok: false, code: 'end-not-after-start', record: active });

    const gap = domain.createEvent(active, {
      ...context,
      time: fixedPort({ ok: false, reason: 'nonexistent' }),
      actorEmail: 'sam@team.com',
      eventId: 'e2',
      visibility: 'team-visible',
      title: 'HQ',
      start: { year: 2026, month: 3, day: 8, hour: 2, minute: 30 },
      end: ten,
    });
    expect(gap).toMatchObject({
      ok: false,
      code: 'nonexistent-local-time',
      field: 'start',
      record: active,
    });
    const ambiguous = domain.createEvent(active, {
      ...context,
      time: fixedPort({ ok: false, reason: 'ambiguous' }),
      actorEmail: 'sam@team.com',
      eventId: 'e2',
      visibility: 'team-visible',
      title: 'HQ',
      start: { year: 2026, month: 11, day: 1, hour: 1, minute: 30 },
      end: ten,
    });
    expect(ambiguous).toMatchObject({
      ok: false,
      code: 'ambiguous-local-time',
      field: 'start',
      record: active,
    });

    const recurring = domain.createEvent(active, {
      ...context,
      actorEmail: 'sam@team.com',
      eventId: 'e2',
      visibility: 'team-visible',
      title: 'HQ',
      start: nine,
      end: ten,
      recurring: true,
    });
    expect(recurring).toMatchObject({
      ok: false,
      code: 'recurrence-not-supported',
      record: active,
    });

    const invited = domain.invite(active, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'ada@team.com',
    });
    if (!invited.ok || invited.record.status !== 'active') return;
    const outsider = domain.createEvent(invited.record, {
      ...context,
      actorEmail: 'ada@team.com',
      eventId: 'e2',
      visibility: 'only-self',
      title: 'Nope',
      start: nine,
      end: ten,
    });
    expect(outsider).toMatchObject({ ok: false, code: 'not-allowed', record: invited.record });

    const joined = domain.acceptInvite(invited.record, { ...context, actorEmail: 'ada@team.com' });
    if (!joined.ok || joined.record.status !== 'active') return;
    const transferred = domain.designate(
      { ...joined.record, events: created.record.events },
      { ...context, actorEmail: 'sam@team.com', email: 'ada@team.com' },
    );
    if (!transferred.ok || transferred.record.status !== 'active') return;
    const nonOwner = domain.modifyEvent(transferred.record, {
      ...context,
      actorEmail: 'ada@team.com',
      eventId: 'e1',
      title: 'Stolen',
    });
    expect(nonOwner).toMatchObject({ ok: false, record: transferred.record });

    const gone = domain.removeMember(transferred.record, {
      ...context,
      actorEmail: 'ada@team.com',
      email: 'sam@team.com',
    });
    expect(gone.ok).toBe(true);
    if (!gone.ok || gone.record.status !== 'active') return;
    const retainedStart = gone.record.events[0]?.start;
    const custodyTitle = domain.modifyEvent(gone.record, {
      ...context,
      actorEmail: 'ada@team.com',
      eventId: 'e1',
      title: '  Clinic  ',
    });
    expect(custodyTitle.ok).toBe(true);
    if (!custodyTitle.ok || custodyTitle.record.status !== 'active') return;
    expect(custodyTitle.record.events[0]).toMatchObject({
      title: 'Clinic',
      visibility: 'team-visible',
      start: retainedStart,
    });

    const calls = fixedPort();
    const locationOnly = domain.modifyEvent(custodyTitle.record, {
      ...context,
      time: calls,
      actorEmail: 'ada@team.com',
      eventId: 'e1',
      location: 'Room',
    });
    expect(locationOnly.ok).toBe(true);
    expect(calls.zones).toEqual([]);

    const visibility = domain.modifyEvent(gone.record, {
      ...context,
      actorEmail: 'ada@team.com',
      eventId: 'e1',
      title: 'Hidden',
      visibility: 'only-self',
    });
    expect(visibility).toMatchObject({ ok: false, code: 'not-allowed', record: gone.record });
    if (visibility.ok || visibility.record.status !== 'active') return;
    expect(visibility.record.events[0]?.title).toBe('HQ');

    const missing = domain.deleteEvent(created.record, {
      ...context,
      actorEmail: 'sam@team.com',
      eventId: 'missing',
    });
    expect(missing).toMatchObject({ ok: false, code: 'event-not-found', record: created.record });
    const deleted = domain.deleteEvent(gone.record, {
      ...context,
      actorEmail: 'ada@team.com',
      eventId: 'e1',
    });
    expect(deleted.ok).toBe(true);
    if (!deleted.ok || deleted.record.status !== 'active') return;
    expect(deleted.record.events).toEqual([]);
  });
});

describe('projection and busyAt', () => {
  it('filters by actor and uses a half-open interval', () => {
    const active = team();
    const context = base(active);
    const invited = domain.invite(active, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'ada@team.com',
    });
    if (!invited.ok || invited.record.status !== 'active') return;
    const inviteView = domain.project(invited.record, 'ada@team.com');
    expect(inviteView).toEqual({
      record: 'active',
      access: 'invite',
      invite: { email: 'ada@team.com' },
    });
    expect(domain.busyAt(inviteView, 'ada@team.com', '2026-01-02T09:00:00.000Z')).toEqual([]);

    const created = domain.createEvent(active, {
      ...context,
      actorEmail: 'sam@team.com',
      eventId: 'team',
      visibility: 'team-visible',
      title: 'HQ',
      start: nine,
      end: ten,
    });
    const priv = domain.createEvent(created.ok ? created.record : active, {
      ...context,
      actorEmail: 'sam@team.com',
      eventId: 'self',
      visibility: 'only-self',
      title: 'Mine',
      start: nine,
      end: ten,
    });
    if (!priv.ok || priv.record.status !== 'active') return;
    const withAda = domain.acceptInvite(
      { ...priv.record, invites: [{ email: 'ada@team.com' }], roster: priv.record.roster },
      { ...context, actorEmail: 'ada@team.com' },
    );
    if (!withAda.ok || withAda.record.status !== 'active') return;
    const ada = domain.project(withAda.record, 'ada@team.com');
    if (ada.access !== 'member') throw new Error('member');
    expect(ada.events.map((event) => event.id)).toEqual(['team']);
    expect(ada.invites).toEqual([]);
    const sam = domain.project(withAda.record, 'sam@team.com');
    if (sam.access !== 'member') throw new Error('member');
    expect(sam.events.map((event) => event.id).sort()).toEqual(['self', 'team']);
    expect(sam.isMaintainer).toBe(true);
    expect(sam.invites).toEqual([]);

    const start = '2026-01-02T09:00:00.000Z';
    const end = '2026-01-02T10:00:00.000Z';
    expect(
      domain.busyAt(ada, 'ada@team.com', start).find((row) => row.email === 'sam@team.com')?.busy,
    ).toBe(true);
    expect(
      domain.busyAt(ada, 'ada@team.com', end).find((row) => row.email === 'sam@team.com')?.busy,
    ).toBe(false);
    expect(
      domain.busyAt(sam, 'sam@team.com', start).find((row) => row.email === 'sam@team.com')?.busy,
    ).toBe(true);
    expect(domain.project(withAda.record, 'bea@team.com')).toEqual({
      record: 'active',
      access: 'no-access',
    });
    expect(domain.project({ status: 'dissolved', generation: 'g1' }, 'sam@team.com').record).toBe(
      'dissolved',
    );
    expect('reminder' in domain).toBe(false);
  });

  it('keeps an ended event visible and lists a member with no events as free', () => {
    const active = team();
    const context = base(active);
    const created = domain.createEvent(active, {
      ...context,
      actorEmail: 'sam@team.com',
      eventId: 'past',
      visibility: 'team-visible',
      title: 'Past',
      start: eight,
      end: nine,
    });
    if (!created.ok || created.record.status !== 'active') return;
    const invited = domain.invite(created.record, {
      ...context,
      actorEmail: 'sam@team.com',
      email: 'ada@team.com',
    });
    if (!invited.ok || invited.record.status !== 'active') return;
    const joined = domain.acceptInvite(invited.record, { ...context, actorEmail: 'ada@team.com' });
    if (!joined.ok || joined.record.status !== 'active') return;
    const view = domain.project(joined.record, 'ada@team.com');
    if (view.access !== 'member') throw new Error('member');
    expect(view.events[0]).toMatchObject({ id: 'past', title: 'Past', ownerEmail: 'sam@team.com' });
    const later = '2026-01-02T11:00:00.000Z';
    const rows = domain.busyAt(view, 'ada@team.com', later);
    expect(rows).toEqual([
      { email: 'sam@team.com', busy: false },
      { email: 'ada@team.com', busy: false },
    ]);
  });
});
