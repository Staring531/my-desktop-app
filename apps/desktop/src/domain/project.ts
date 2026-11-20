import { canonicalize } from './email.js';
import type { ActiveRecord, BusyRow, Projection, ScheduleEvent, TeamRecord } from './types.js';

export function project(record: TeamRecord, actorEmail: string | undefined): Projection {
  if (record.status === 'absent') return { record: 'absent', access: 'no-access' };
  if (record.status === 'dissolved') return { record: 'dissolved', access: 'no-access' };
  const actor = actorEmail === undefined ? undefined : canonicalize(actorEmail);
  const email = actor?.ok === true ? actor.email : undefined;
  if (email === undefined) return { record: 'active', access: 'no-access' };
  const member = record.roster.some((entry) => entry.email === email);
  if (!member) {
    const invite = record.invites.find((entry) => entry.email === email);
    if (invite === undefined) return { record: 'active', access: 'no-access' };
    return { record: 'active', access: 'invite', invite: { email: invite.email } };
  }
  const isMaintainer = record.maintainerEmail === email;
  return {
    record: 'active',
    access: 'member',
    actorEmail: email,
    isMaintainer,
    roster: record.roster.map((entry) => ({ email: entry.email })),
    invites: isMaintainer ? record.invites.map((entry) => ({ email: entry.email })) : [],
    events: visibleEvents(record, email),
  };
}

function visibleEvents(record: ActiveRecord, actor: string): ScheduleEvent[] {
  return record.events
    .filter((event) => event.visibility === 'team-visible' || event.ownerEmail === actor)
    .map((event) => ({ ...event }));
}

export function busyAt(projection: Projection, actorEmail: string, instant: string): BusyRow[] {
  if (projection.access !== 'member') return [];
  const actor = canonicalize(actorEmail);
  if (!actor.ok) return [];
  return projection.roster.map((entry) => ({
    email: entry.email,
    busy: covers(projection.events, entry.email, actor.email, instant),
  }));
}

function covers(events: ScheduleEvent[], member: string, viewer: string, instant: string): boolean {
  return events.some((event) => {
    if (event.ownerEmail !== member) return false;
    if (member !== viewer && event.visibility !== 'team-visible') return false;
    return event.start <= instant && instant < event.end;
  });
}
