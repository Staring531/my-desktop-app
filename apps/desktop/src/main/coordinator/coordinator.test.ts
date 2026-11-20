import { describe, expect, it } from 'vitest';
import type { CommandResult, Diagnostic, PushedProjection } from '../../contract/api.js';
import type { CivilTime, ConvertResult, TimePort } from '../../domain/time.js';
import type { ActiveRecord, TeamRecord } from '../../domain/types.js';
import type { LoadResult, StoredRecord, TeamStore } from '../store/index.js';
import { createCoordinator } from './index.js';

const nine: CivilTime = { year: 2026, month: 1, day: 2, hour: 9, minute: 0 };
const ten: CivilTime = { year: 2026, month: 1, day: 2, hour: 10, minute: 0 };
const fall: CivilTime = { year: 2026, month: 11, day: 1, hour: 1, minute: 30 };

function memoryStore(
  initial: TeamRecord = { status: 'absent' },
): TeamStore & { record: TeamRecord; replaces: number; fail: boolean } {
  const state = {
    record: initial,
    replaces: 0,
    fail: false,
    load(): LoadResult {
      if (state.record.status === 'absent') return { kind: 'absent' };
      return { kind: 'record', record: state.record };
    },
    replace(record: StoredRecord) {
      if (state.fail) return { ok: false as const, reason: 'replace-failed' as const };
      state.replaces += 1;
      state.record = record;
      return { ok: true as const };
    },
  };
  return state;
}

function port(): TimePort & { calls: string[] } {
  return {
    calls: [],
    convert(zone, civil, occurrence) {
      this.calls.push(`${zone}:${occurrence ?? ''}`);
      if (civil.month === 13) return { ok: false, reason: 'invalid' };
      if (civil.hour === 2 && civil.minute === 30) return { ok: false, reason: 'nonexistent' };
      if (civil.hour === 1 && civil.minute === 30) {
        if (occurrence === undefined) return { ok: false, reason: 'ambiguous' };
        const instant =
          occurrence === 'earlier' ? '2026-11-01T05:30:00.000Z' : '2026-11-01T06:30:00.000Z';
        return { ok: true, instant };
      }
      const result: ConvertResult = {
        ok: true,
        instant: `2026-${String(civil.month).padStart(2, '0')}-${String(civil.day).padStart(2, '0')}T${String(civil.hour).padStart(2, '0')}:00:00.000Z`,
      };
      return result;
    },
  };
}

function harness(store = memoryStore()) {
  const lines: Diagnostic[] = [];
  const pushes: PushedProjection[][] = [];
  let ids = 0;
  const time = port();
  const coordinator = createCoordinator({
    store,
    time,
    labels: { offsetAt: (_zone, instant) => (instant.includes('T14') ? '-05:00' : '-04:00') },
    zone: () => 'America/New_York',
    mintId: () => `id-${++ids}`,
    now: () => '2026-11-20T12:00:00.000Z',
    diagnose: (line) => lines.push(line),
  });
  function session(): string {
    const id = coordinator.openSession();
    const bucket: PushedProjection[] = [];
    pushes.push(bucket);
    coordinator.subscribe(id, (projection) => {
      if (projection.zone === 'throw') throw new Error('push');
      bucket.push(projection);
    });
    return id;
  }
  return { store, coordinator, lines, time, session };
}

async function bind(
  coordinator: ReturnType<typeof createCoordinator>,
  id: string,
  email: string,
): Promise<CommandResult> {
  return coordinator.bind(id, email);
}

describe('coordinator', () => {
  it('AC-002 and AC-050: one create wins and a later create uses the next generation', async () => {
    const { store, coordinator, session } = harness();
    const first = session();
    const second = session();
    await bind(coordinator, first, 'Sam@Team.com');
    await bind(coordinator, second, 'ada@team.com');
    const created = coordinator.command(first, {
      name: 'createTeam',
      actorEmail: 'ada@team.com',
      generation: 'nope',
    });
    const lost = coordinator.command(second, { name: 'createTeam', zone: 'Mars' });
    const winner = await created;
    const loser = await lost;
    expect(winner.ok).toBe(true);
    expect(loser).toMatchObject({ ok: false, code: 'generation-mismatch' });
    expect(store.replaces).toBe(1);
    if (!winner.ok || winner.projection.access !== 'member') return;
    expect(winner.projection.actorEmail).toBe('sam@team.com');
    const again = await coordinator.command(first, { name: 'createTeam' });
    expect(again).toMatchObject({ ok: false, code: 'team-already-active' });
    expect(store.replaces).toBe(1);

    await coordinator.command(first, { name: 'dissolve' });
    const next = await coordinator.command(first, { name: 'createTeam' });
    expect(next.ok).toBe(true);
    if (store.record.status !== 'active') return;
    expect(store.record.generation).not.toBe('id-3');
    expect(store.record.roster).toEqual([{ email: 'sam@team.com' }]);
  });

  it('AC-024 AC-026 AC-031 AC-035 AC-046 keep completion order and skip replace on rejection', async () => {
    const active: ActiveRecord = {
      status: 'active',
      generation: 'g1',
      maintainerEmail: 'sam@team.com',
      roster: [{ email: 'sam@team.com' }, { email: 'ada@team.com' }],
      invites: [{ email: 'bea@team.com' }],
      events: [
        {
          id: 'team',
          ownerEmail: 'ada@team.com',
          visibility: 'team-visible',
          title: 'HQ',
          location: '',
          description: '',
          start: '2026-01-02T09:00:00.000Z',
          end: '2026-01-02T10:00:00.000Z',
        },
      ],
    };
    const { store, coordinator, session } = harness(memoryStore(active));
    const sam = session();
    const ada = session();
    const later = session();
    await bind(coordinator, sam, 'sam@team.com');
    await bind(coordinator, ada, 'ada@team.com');
    const removal = coordinator.command(sam, {
      name: 'removeMember',
      email: 'ada@team.com',
      actorEmail: 'ada@team.com',
    });
    const bindBehind = coordinator.bind(later, 'bea@team.com');
    await removal;
    const bound = await bindBehind;
    expect(bound.ok).toBe(true);
    if (!bound.ok || bound.projection.access !== 'invite') return;
    expect(store.replaces).toBe(1);

    store.record = active;
    const save = coordinator.command(ada, {
      name: 'createEvent',
      visibility: 'only-self',
      title: 'Private',
      start: nine,
      end: ten,
      eventId: 'from-renderer',
      actorEmail: 'sam@team.com',
      zone: 'Mars',
      generation: 'nope',
    });
    const remove = coordinator.command(sam, { name: 'removeMember', email: 'ada@team.com' });
    await save;
    await remove;
    if (store.record.status !== 'active') return;
    expect(store.record.events.map((event) => event.id)).toEqual(['team']);
    expect(store.record.events.some((event) => event.visibility === 'only-self')).toBe(false);

    const teamAgain: ActiveRecord = {
      ...active,
      events: active.events,
      roster: [{ email: 'sam@team.com' }, { email: 'ada@team.com' }],
    };
    store.record = teamAgain;
    const before = store.replaces;
    const dropped = coordinator.command(sam, { name: 'removeMember', email: 'ada@team.com' });
    const visibility = coordinator.command(ada, {
      name: 'modifyEvent',
      eventId: 'team',
      visibility: 'only-self',
      title: 'Hidden',
    });
    await dropped;
    const hidden = await visibility;
    expect(hidden).toMatchObject({ ok: false, code: 'not-allowed' });
    if (store.record.status !== 'active') return;
    expect(store.record.events[0]).toMatchObject({ title: 'HQ', visibility: 'team-visible' });
    expect(store.replaces).toBe(before + 1);

    const other = session();
    await bind(coordinator, other, 'sam@team.com');
    const seen: string[][] = [];
    coordinator.subscribe(other, (projection) => {
      if (projection.access === 'member') seen.push(projection.events.map((event) => event.id));
    });
    const deleted = await coordinator.command(sam, { name: 'deleteEvent', eventId: 'team' });
    expect(deleted.ok).toBe(true);
    expect(seen.at(-1)).toEqual([]);
    const opened = session();
    const fresh = await bind(coordinator, opened, 'sam@team.com');
    expect(fresh.ok).toBe(true);
    if (!fresh.ok || fresh.projection.access !== 'member') return;
    expect(fresh.projection.events).toEqual([]);

    const failed = await coordinator.command(sam, {
      name: 'modifyEvent',
      eventId: 'missing',
      title: 'Nope',
    });
    expect(failed).toMatchObject({ ok: false, code: 'event-not-found' });
    expect(fresh.projection.events).toEqual([]);

    const decline = await coordinator.command(opened, { name: 'declineInvite' });
    expect(decline).toMatchObject({ ok: false, code: 'no-matching-invite' });
    expect(store.replaces).toBe(before + 2);
  });

  it('AC-025 rejects a save after dissolution and after the next generation', async () => {
    const { store, coordinator, session } = harness(
      memoryStore({
        status: 'active',
        generation: 'g1',
        maintainerEmail: 'sam@team.com',
        roster: [{ email: 'sam@team.com' }],
        invites: [],
        events: [],
      }),
    );
    const sam = session();
    await bind(coordinator, sam, 'sam@team.com');
    const dissolved = coordinator.command(sam, { name: 'dissolve' });
    const save = coordinator.command(sam, {
      name: 'createEvent',
      visibility: 'team-visible',
      title: 'Late',
      start: nine,
      end: ten,
    });
    expect(await dissolved).toMatchObject({ ok: true });
    expect(await save).toMatchObject({ ok: false, code: 'dissolved' });
    const created = coordinator.command(sam, { name: 'createTeam' });
    const old = coordinator.command(sam, {
      name: 'createEvent',
      visibility: 'team-visible',
      title: 'Old',
      start: nine,
      end: ten,
    });
    expect((await created).ok).toBe(true);
    expect(await old).toMatchObject({ ok: false, code: 'generation-mismatch' });
    if (store.record.status !== 'active') return;
    expect(store.record.events).toEqual([]);
  });

  it('AC-014 and AC-028 return time failures without replacing, then a choice can commit', async () => {
    const { store, coordinator, lines, time, session } = harness(
      memoryStore({
        status: 'active',
        generation: 'g1',
        maintainerEmail: 'sam@team.com',
        roster: [{ email: 'sam@team.com' }],
        invites: [],
        events: [],
      }),
    );
    const sam = session();
    await bind(coordinator, sam, 'sam@team.com');
    const before = store.replaces;
    const gap = await coordinator.command(sam, {
      name: 'createEvent',
      visibility: 'team-visible',
      title: 'Gap',
      start: { year: 2026, month: 3, day: 8, hour: 2, minute: 30 },
      end: ten,
    });
    expect(gap).toEqual({ ok: false, code: 'nonexistent-local-time', field: 'start' });
    const ambiguous = await coordinator.command(sam, {
      name: 'createEvent',
      visibility: 'team-visible',
      title: 'Fold',
      start: fall,
      end: fall,
    });
    expect(ambiguous).toMatchObject({ ok: false, code: 'ambiguous-local-time', field: 'start' });
    if (ambiguous.ok) return;
    expect(ambiguous.earlier).not.toBe(ambiguous.later);
    expect(store.replaces).toBe(before);
    expect(lines.at(-1) && Object.keys(lines.at(-1) ?? {}).sort()).toEqual([
      'code',
      'command',
      'generation',
      'time',
    ]);
    const saved = await coordinator.command(sam, {
      name: 'createEvent',
      visibility: 'team-visible',
      title: 'Fold',
      start: fall,
      end: { year: 2026, month: 11, day: 1, hour: 12, minute: 0 },
      startOccurrence: 'earlier',
    });
    expect(saved.ok).toBe(true);
    if (store.record.status !== 'active') return;
    expect(store.record.events[0]?.start).toBe('2026-11-01T05:30:00.000Z');
    expect(store.record.events[0]?.id).not.toBe('from-renderer');
    expect(time.calls.some((call) => call.startsWith('America/New_York'))).toBe(true);
  });

  it('continues the queue after a failed push and keeps bytes after replace-failed', async () => {
    const store = memoryStore({
      status: 'active',
      generation: 'g1',
      maintainerEmail: 'sam@team.com',
      roster: [{ email: 'sam@team.com' }],
      invites: [],
      events: [],
    });
    const { coordinator, session } = harness(store);
    const sam = session();
    await bind(coordinator, sam, 'sam@team.com');
    coordinator.subscribe(sam, () => {
      throw new Error('push');
    });
    const invited = await coordinator.command(sam, { name: 'invite', email: 'ada@team.com' });
    expect(invited.ok).toBe(true);
    const declined = await coordinator.command(sam, {
      name: 'cancelInvite',
      email: 'missing@team.com',
    });
    expect(declined).toMatchObject({ ok: false, code: 'no-matching-invite' });
    store.fail = true;
    const replaces = store.replaces;
    const failed = await coordinator.command(sam, { name: 'invite', email: 'bea@team.com' });
    expect(failed).toMatchObject({ ok: false, code: 'replace-failed' });
    expect(store.replaces).toBe(replaces);
    if (store.record.status !== 'active') return;
    expect(store.record.invites).toEqual([{ email: 'ada@team.com' }]);
  });

  it('rejects an unbound command and an unreadable file before the domain', async () => {
    const store = memoryStore();
    store.load = () => ({ kind: 'unreadable' });
    const { coordinator, session } = harness(store);
    const id = session();
    expect(await coordinator.command(id, { name: 'createTeam' })).toEqual({
      ok: false,
      code: 'unbound-session',
    });
    expect(await coordinator.bind(id, 'sam @team.com')).toEqual({
      ok: false,
      code: 'record-unreadable',
    });
    expect(store.replaces).toBe(0);
  });
});
