import {
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { checkInvariants } from '../../domain/invariants.js';
import type {
  ActiveRecord,
  DissolvedRecord,
  ScheduleEvent,
  Visibility,
} from '../../domain/types.js';

export const TEAM_FILE = 'team-record.json';
export const TEAM_TEMP = 'team-record.json.tmp';

const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;

export type StoredRecord = ActiveRecord | DissolvedRecord;

export type LoadResult =
  { kind: 'absent' } | { kind: 'unreadable' } | { kind: 'record'; record: StoredRecord };

export type ReplaceResult =
  { ok: true } | { ok: false; reason: 'unreadable' | 'serialize' | 'replace-failed' };

export type StoreHooks = {
  fsync?: (fd: number) => void;
  rename?: (from: string, to: string) => void;
  stringify?: (value: unknown) => string;
};

export type TeamStore = {
  load: () => LoadResult;
  replace: (record: StoredRecord) => ReplaceResult;
};

export function createFileStore(directory: string, hooks: StoreHooks = {}): TeamStore {
  const file = join(directory, TEAM_FILE);
  const temp = join(directory, TEAM_TEMP);
  const fsync = hooks.fsync ?? fsyncSync;
  const rename = hooks.rename ?? renameSync;
  const stringify = hooks.stringify ?? JSON.stringify;

  return {
    load() {
      if (!existsSync(file)) return { kind: 'absent' };
      try {
        return parseDocument(readFileSync(file, 'utf8'));
      } catch {
        return { kind: 'unreadable' };
      }
    },
    replace(record) {
      if (existsSync(file)) {
        const current = this.load();
        if (current.kind !== 'record') return { ok: false, reason: 'unreadable' };
      }
      let text: string;
      try {
        text = stringify(toDocument(record));
      } catch {
        return { ok: false, reason: 'serialize' };
      }
      let fd: number | undefined;
      try {
        writeFileSync(temp, text);
        fd = openSync(temp, 'r+');
        fsync(fd);
        closeSync(fd);
        fd = undefined;
        rename(temp, file);
      } catch {
        if (fd !== undefined) {
          try {
            closeSync(fd);
          } catch {
            /* The failed step must leave the previous document in place. */
          }
        }
        return { ok: false, reason: 'replace-failed' };
      }
      return { ok: true };
    },
  };
}

export function parseDocument(text: string): LoadResult {
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    return { kind: 'unreadable' };
  }
  const record = toRecord(value);
  if (record === undefined || !checkInvariants(record).ok) return { kind: 'unreadable' };
  return { kind: 'record', record };
}

export function toDocument(record: StoredRecord): unknown {
  if (record.status === 'dissolved') {
    return { formatVersion: 1, status: 'dissolved', generation: record.generation };
  }
  return {
    formatVersion: 1,
    status: 'active',
    generation: record.generation,
    maintainerEmail: record.maintainerEmail,
    roster: record.roster.map((entry) => ({ email: entry.email })),
    invites: record.invites.map((entry) => ({ email: entry.email })),
    events: record.events.map((event) => ({ ...event })),
  };
}

function toRecord(value: unknown): StoredRecord | undefined {
  if (!isRecord(value) || value.formatVersion !== 1) return undefined;
  if (value.status === 'dissolved') {
    if (typeof value.generation !== 'string') return undefined;
    const dissolved: DissolvedRecord & Record<string, unknown> = {
      status: 'dissolved',
      generation: value.generation,
    };
    if ('roster' in value || 'events' in value || 'invites' in value || 'maintainerEmail' in value)
      dissolved.roster = [];
    return dissolved;
  }
  if (
    value.status !== 'active' ||
    typeof value.generation !== 'string' ||
    typeof value.maintainerEmail !== 'string'
  ) {
    return undefined;
  }
  const roster = entries(value.roster);
  const invites = entries(value.invites);
  const events = eventsOf(value.events);
  if (roster === undefined || invites === undefined || events === undefined) return undefined;
  return {
    status: 'active',
    generation: value.generation,
    maintainerEmail: value.maintainerEmail,
    roster,
    invites,
    events,
  };
}

function entries(value: unknown): { email: string }[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const emails: { email: string }[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.email !== 'string') return undefined;
    emails.push({ email: entry.email });
  }
  return emails;
}

function eventsOf(value: unknown): ScheduleEvent[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const events: ScheduleEvent[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return undefined;
    const visibility = entry.visibility;
    if (!isVisibility(visibility)) return undefined;
    if (
      typeof entry.id !== 'string' ||
      typeof entry.ownerEmail !== 'string' ||
      typeof entry.title !== 'string' ||
      typeof entry.location !== 'string' ||
      typeof entry.description !== 'string' ||
      typeof entry.start !== 'string' ||
      typeof entry.end !== 'string' ||
      !INSTANT.test(entry.start) ||
      !INSTANT.test(entry.end)
    ) {
      return undefined;
    }
    events.push({
      id: entry.id,
      ownerEmail: entry.ownerEmail,
      visibility,
      title: entry.title,
      location: entry.location,
      description: entry.description,
      start: entry.start,
      end: entry.end,
    });
  }
  return events;
}

function isVisibility(value: unknown): value is Visibility {
  return value === 'team-visible' || value === 'only-self';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
