export type Visibility = 'team-visible' | 'only-self';

export type RosterEntry = { email: string };
export type Invite = { email: string };

export type ScheduleEvent = {
  id: string;
  ownerEmail: string;
  visibility: Visibility;
  title: string;
  location: string;
  description: string;
  start: string;
  end: string;
};

export type AbsentRecord = { status: 'absent' };

export type DissolvedRecord = {
  status: 'dissolved';
  generation: string;
};

export type ActiveRecord = {
  status: 'active';
  generation: string;
  maintainerEmail: string;
  roster: RosterEntry[];
  invites: Invite[];
  events: ScheduleEvent[];
};

export type TeamRecord = AbsentRecord | ActiveRecord | DissolvedRecord;

export type Stamp = { kind: 'absent' } | { kind: 'generation'; generation: string };

export type RejectionCode =
  | 'unusable-email'
  | 'team-already-active'
  | 'not-allowed'
  | 'invite-exists'
  | 'already-member'
  | 'no-matching-invite'
  | 'empty-title'
  | 'end-not-after-start'
  | 'nonexistent-local-time'
  | 'ambiguous-local-time'
  | 'invalid-local-time'
  | 'recurrence-not-supported'
  | 'all-day-not-supported'
  | 'event-not-found'
  | 'generation-mismatch'
  | 'dissolved';

export type DomainResult =
  | { ok: true; record: TeamRecord }
  | { ok: false; code: RejectionCode; record: TeamRecord; field?: 'start' | 'end' };

export type MemberEvent = ScheduleEvent;

export type NoAccessProjection = {
  record: 'absent' | 'active' | 'dissolved';
  access: 'no-access';
};

export type InviteProjection = {
  record: 'active';
  access: 'invite';
  invite: Invite;
};

export type MemberProjection = {
  record: 'active';
  access: 'member';
  actorEmail: string;
  isMaintainer: boolean;
  roster: RosterEntry[];
  invites: Invite[];
  events: MemberEvent[];
};

export type Projection = NoAccessProjection | InviteProjection | MemberProjection;

export type BusyRow = { email: string; busy: boolean };
