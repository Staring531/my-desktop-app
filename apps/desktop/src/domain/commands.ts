import { canonicalize } from './email.js';
import { checkInvariants } from './invariants.js';
import type { CivilTime, Occurrence, TimePort } from './time.js';
import type {
  ActiveRecord,
  DomainResult,
  RejectionCode,
  ScheduleEvent,
  Stamp,
  TeamRecord,
  Visibility,
} from './types.js';

export type CommandContext = {
  actorEmail: string;
  stamp: Stamp;
  zone: string;
  time: TimePort;
};

export type CreateTeamInput = CommandContext & { generation: string };

export type EmailTarget = CommandContext & { email: string };

export type CreateEventInput = CommandContext & {
  eventId: string;
  visibility: Visibility;
  title: string;
  location?: string;
  description?: string;
  start: CivilTime;
  end: CivilTime;
  startOccurrence?: Occurrence;
  endOccurrence?: Occurrence;
  recurring?: boolean;
  allDay?: boolean;
};

export type ModifyEventInput = CommandContext & {
  eventId: string;
  visibility?: Visibility;
  title?: string;
  location?: string;
  description?: string;
  start?: CivilTime;
  end?: CivilTime;
  startOccurrence?: Occurrence;
  endOccurrence?: Occurrence;
  recurring?: boolean;
  allDay?: boolean;
};

function fail(record: TeamRecord, code: RejectionCode, field?: 'start' | 'end'): DomainResult {
  return field === undefined ? { ok: false, code, record } : { ok: false, code, record, field };
}

function succeed(record: TeamRecord, next: ActiveRecord | TeamRecord): DomainResult {
  if (!checkInvariants(next).ok) return fail(record, 'not-allowed');
  return { ok: true, record: next };
}

function stampMatches(record: TeamRecord, stamp: Stamp): DomainResult | undefined {
  if (record.status === 'absent') {
    return stamp.kind === 'absent' ? undefined : fail(record, 'generation-mismatch');
  }
  if (stamp.kind === 'absent' || stamp.generation !== record.generation) {
    return fail(record, 'generation-mismatch');
  }
  if (record.status === 'dissolved') return fail(record, 'dissolved');
  return undefined;
}

function actorOf(record: TeamRecord, email: string): string | undefined {
  const canonical = canonicalize(email);
  if (!canonical.ok) return undefined;
  return canonical.email;
}

function isMember(record: ActiveRecord, email: string): boolean {
  return record.roster.some((entry) => entry.email === email);
}

function cloneActive(record: ActiveRecord): ActiveRecord {
  return {
    status: 'active',
    generation: record.generation,
    maintainerEmail: record.maintainerEmail,
    roster: record.roster.map((entry) => ({ email: entry.email })),
    invites: record.invites.map((entry) => ({ email: entry.email })),
    events: record.events.map((event) => ({ ...event })),
  };
}

export function createTeam(record: TeamRecord, input: CreateTeamInput): DomainResult {
  const email = canonicalize(input.actorEmail);
  if (
    record.status === 'active' &&
    input.stamp.kind === 'generation' &&
    input.stamp.generation === record.generation
  ) {
    return fail(record, 'team-already-active');
  }
  if (record.status === 'absent' && input.stamp.kind === 'generation')
    return fail(record, 'generation-mismatch');
  if (record.status === 'active') return fail(record, 'generation-mismatch');
  if (
    record.status === 'dissolved' &&
    (input.stamp.kind === 'absent' || input.stamp.generation !== record.generation)
  ) {
    return fail(record, 'generation-mismatch');
  }
  if (!email.ok) return fail(record, 'unusable-email');
  if (input.generation.length === 0) return fail(record, 'generation-mismatch');
  const next: ActiveRecord = {
    status: 'active',
    generation: input.generation,
    maintainerEmail: email.email,
    roster: [{ email: email.email }],
    invites: [],
    events: [],
  };
  return succeed(record, next);
}

export function invite(record: TeamRecord, input: EmailTarget): DomainResult {
  const blocked = stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  const target = canonicalize(input.email);
  if (!target.ok) return fail(record, 'unusable-email');
  if (actor === undefined || actor !== record.maintainerEmail) return fail(record, 'not-allowed');
  if (isMember(record, target.email)) return fail(record, 'already-member');
  if (record.invites.some((entry) => entry.email === target.email))
    return fail(record, 'invite-exists');
  const next = cloneActive(record);
  next.invites = [...next.invites, { email: target.email }];
  return succeed(record, next);
}

export function cancelInvite(record: TeamRecord, input: EmailTarget): DomainResult {
  const blocked = stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  const target = canonicalize(input.email);
  if (!target.ok) return fail(record, 'unusable-email');
  if (actor === undefined || actor !== record.maintainerEmail) return fail(record, 'not-allowed');
  if (!record.invites.some((entry) => entry.email === target.email))
    return fail(record, 'no-matching-invite');
  const next = cloneActive(record);
  next.invites = next.invites.filter((entry) => entry.email !== target.email);
  return succeed(record, next);
}

export function acceptInvite(record: TeamRecord, input: CommandContext): DomainResult {
  return endInvite(record, input, true);
}

export function declineInvite(record: TeamRecord, input: CommandContext): DomainResult {
  return endInvite(record, input, false);
}

function endInvite(record: TeamRecord, input: CommandContext, accept: boolean): DomainResult {
  const blocked = stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  if (actor === undefined || !record.invites.some((entry) => entry.email === actor)) {
    return fail(record, 'no-matching-invite');
  }
  const next = cloneActive(record);
  next.invites = next.invites.filter((entry) => entry.email !== actor);
  if (accept) next.roster = [...next.roster, { email: actor }];
  return succeed(record, next);
}

export function designate(record: TeamRecord, input: EmailTarget): DomainResult {
  const blocked = stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  const target = canonicalize(input.email);
  if (actor === undefined || actor !== record.maintainerEmail || !target.ok)
    return fail(record, 'not-allowed');
  if (target.email === actor || !isMember(record, target.email)) return fail(record, 'not-allowed');
  const next = cloneActive(record);
  next.maintainerEmail = target.email;
  return succeed(record, next);
}

export function removeMember(record: TeamRecord, input: EmailTarget): DomainResult {
  const blocked = stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  const target = canonicalize(input.email);
  if (actor === undefined || actor !== record.maintainerEmail || !target.ok)
    return fail(record, 'not-allowed');
  if (target.email === actor || !isMember(record, target.email)) return fail(record, 'not-allowed');
  const next = cloneActive(record);
  next.roster = next.roster.filter((entry) => entry.email !== target.email);
  next.events = next.events.filter(
    (event) => event.ownerEmail !== target.email || event.visibility !== 'only-self',
  );
  return succeed(record, next);
}

export function dissolve(record: TeamRecord, input: CommandContext): DomainResult {
  const blocked = stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  if (actor === undefined || !isMember(record, actor) || record.roster.length !== 1)
    return fail(record, 'not-allowed');
  return { ok: true, record: { status: 'dissolved', generation: record.generation } };
}

function modeRejection(
  recurring: boolean | undefined,
  allDay: boolean | undefined,
  record: TeamRecord,
): DomainResult | undefined {
  if (recurring === true) return fail(record, 'recurrence-not-supported');
  if (allDay === true) return fail(record, 'all-day-not-supported');
  return undefined;
}

function convertField(
  record: TeamRecord,
  time: TimePort,
  zone: string,
  field: 'start' | 'end',
  civil: CivilTime,
  occurrence: Occurrence | undefined,
): { ok: true; instant: string } | DomainResult {
  const converted =
    occurrence === undefined ? time.convert(zone, civil) : time.convert(zone, civil, occurrence);
  if (converted.ok) return converted;
  const code =
    converted.reason === 'nonexistent'
      ? 'nonexistent-local-time'
      : converted.reason === 'ambiguous'
        ? 'ambiguous-local-time'
        : 'invalid-local-time';
  return fail(record, code, field);
}

export function createEvent(record: TeamRecord, input: CreateEventInput): DomainResult {
  const blocked =
    modeRejection(input.recurring, input.allDay, record) ?? stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  if (actor === undefined || !isMember(record, actor)) return fail(record, 'not-allowed');
  if (input.eventId.length === 0 || record.events.some((event) => event.id === input.eventId)) {
    return fail(record, 'not-allowed');
  }
  const title = input.title.trim();
  if (title.length === 0) return fail(record, 'empty-title');
  const start = convertField(
    record,
    input.time,
    input.zone,
    'start',
    input.start,
    input.startOccurrence,
  );
  if (!('instant' in start)) return start;
  const end = convertField(record, input.time, input.zone, 'end', input.end, input.endOccurrence);
  if (!('instant' in end)) return end;
  if (end.instant <= start.instant) return fail(record, 'end-not-after-start');
  const event: ScheduleEvent = {
    id: input.eventId,
    ownerEmail: actor,
    visibility: input.visibility,
    title,
    location: (input.location ?? '').trim(),
    description: (input.description ?? '').trim(),
    start: start.instant,
    end: end.instant,
  };
  const next = cloneActive(record);
  next.events = [...next.events, event];
  return succeed(record, next);
}

export function modifyEvent(record: TeamRecord, input: ModifyEventInput): DomainResult {
  const blocked =
    modeRejection(input.recurring, input.allDay, record) ?? stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  const current = record.events.find((event) => event.id === input.eventId);
  if (actor === undefined) return fail(record, 'not-allowed');
  if (current === undefined) return fail(record, 'event-not-found');
  const ownerIsMember = isMember(record, current.ownerEmail);
  const ownerEdit = ownerIsMember && actor === current.ownerEmail;
  const custody =
    !ownerIsMember && current.visibility === 'team-visible' && actor === record.maintainerEmail;
  if (!ownerEdit && !custody) return fail(record, 'not-allowed');
  if (custody && input.visibility !== undefined && input.visibility !== current.visibility) {
    return fail(record, 'not-allowed');
  }
  const title = input.title === undefined ? current.title : input.title.trim();
  if (title.length === 0) return fail(record, 'empty-title');
  let start = current.start;
  let end = current.end;
  if (input.start !== undefined) {
    const converted = convertField(
      record,
      input.time,
      input.zone,
      'start',
      input.start,
      input.startOccurrence,
    );
    if (!('instant' in converted)) return converted;
    start = converted.instant;
  }
  if (input.end !== undefined) {
    const converted = convertField(
      record,
      input.time,
      input.zone,
      'end',
      input.end,
      input.endOccurrence,
    );
    if (!('instant' in converted)) return converted;
    end = converted.instant;
  }
  if (end <= start) return fail(record, 'end-not-after-start');
  const nextEvent: ScheduleEvent = {
    ...current,
    visibility: input.visibility ?? current.visibility,
    title,
    location: input.location === undefined ? current.location : input.location.trim(),
    description: input.description === undefined ? current.description : input.description.trim(),
    start,
    end,
  };
  const next = cloneActive(record);
  next.events = next.events.map((event) => (event.id === current.id ? nextEvent : event));
  return succeed(record, next);
}

export function deleteEvent(
  record: TeamRecord,
  input: CommandContext & { eventId: string },
): DomainResult {
  const blocked = stampMatches(record, input.stamp);
  if (blocked) return blocked;
  if (record.status !== 'active') return fail(record, 'not-allowed');
  const actor = actorOf(record, input.actorEmail);
  const current = record.events.find((event) => event.id === input.eventId);
  if (actor === undefined) return fail(record, 'not-allowed');
  if (current === undefined) return fail(record, 'event-not-found');
  const ownerIsMember = isMember(record, current.ownerEmail);
  const ownerEdit = ownerIsMember && actor === current.ownerEmail;
  const custody =
    !ownerIsMember && current.visibility === 'team-visible' && actor === record.maintainerEmail;
  if (!ownerEdit && !custody) return fail(record, 'not-allowed');
  const next = cloneActive(record);
  next.events = next.events.filter((event) => event.id !== current.id);
  return succeed(record, next);
}
