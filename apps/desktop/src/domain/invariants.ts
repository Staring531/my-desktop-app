import type { ActiveRecord, TeamRecord } from './types.js';

export type InvariantResult = { ok: true } | { ok: false; reason: string };

export function checkInvariants(record: TeamRecord): InvariantResult {
  if (record.status === 'absent') {
    return 'generation' in record ? { ok: false, reason: 'absent-has-generation' } : { ok: true };
  }
  if (record.generation.length === 0) return { ok: false, reason: 'empty-generation' };
  if (record.status === 'dissolved') {
    if ('roster' in record || 'events' in record || 'maintainerEmail' in record) {
      return { ok: false, reason: 'dissolved-has-team-fields' };
    }
    return { ok: true };
  }
  return checkActive(record);
}

function checkActive(record: ActiveRecord): InvariantResult {
  if (!record.roster.some((entry) => entry.email === record.maintainerEmail)) {
    return { ok: false, reason: 'maintainer-not-on-roster' };
  }
  if (new Set(record.roster.map((entry) => entry.email)).size !== record.roster.length) {
    return { ok: false, reason: 'duplicate-roster-email' };
  }
  if (new Set(record.invites.map((entry) => entry.email)).size !== record.invites.length) {
    return { ok: false, reason: 'duplicate-invite-email' };
  }
  if (
    record.invites.some((invite) => record.roster.some((entry) => entry.email === invite.email))
  ) {
    return { ok: false, reason: 'invite-for-member' };
  }
  const ids = record.events.map((event) => event.id);
  if (ids.some((id) => id.length === 0) || new Set(ids).size !== ids.length) {
    return { ok: false, reason: 'event-id' };
  }
  for (const event of record.events) {
    if (event.visibility !== 'team-visible' && event.visibility !== 'only-self') {
      return { ok: false, reason: 'visibility' };
    }
    if (event.title.trim().length === 0) return { ok: false, reason: 'empty-title' };
    if (event.end <= event.start) return { ok: false, reason: 'end-not-after-start' };
  }
  return { ok: true };
}
