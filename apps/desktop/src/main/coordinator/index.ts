import type {
  CommandResult,
  Diagnostic,
  PushedProjection,
  RendererCommand,
} from '../../contract/api.js';
import * as domain from '../../domain/commands.js';
import { canonicalize } from '../../domain/email.js';
import { project } from '../../domain/project.js';
import type { LabelPort, TimePort } from '../../domain/time.js';
import type { CivilTime, Occurrence } from '../../domain/time.js';
import type {
  DomainResult,
  Projection,
  ScheduleEvent,
  Stamp,
  TeamRecord,
  Visibility,
} from '../../domain/types.js';
import type { LoadResult, StoredRecord, TeamStore } from '../store/index.js';

export type { CommandResult, Diagnostic, PushedProjection };

type Session = {
  email?: string;
  open: boolean;
  listener?: (projection: PushedProjection) => void;
};

export type Coordinator = {
  openSession: () => string;
  closeSession: (sessionId: string) => void;
  subscribe: (sessionId: string, listener: (projection: PushedProjection) => void) => void;
  bind: (sessionId: string, requestedEmail: string) => Promise<CommandResult>;
  command: (sessionId: string, payload: unknown) => Promise<CommandResult>;
  focusWriter: () => void;
  writer: boolean;
  onWriter: (listener: () => void) => void;
};

export function createCoordinator(deps: {
  store: TeamStore;
  time: TimePort;
  labels: LabelPort;
  zone: () => string;
  mintId: () => string;
  now: () => string;
  diagnose?: (line: Diagnostic) => void;
}): Coordinator {
  const sessions = new Map<string, Session>();
  let chain: Promise<void> = Promise.resolve();
  let writer = false;
  let writerListener: (() => void) | undefined;

  function enqueue(work: () => CommandResult): Promise<CommandResult> {
    const run = chain.then(() => {
      try {
        return work();
      } catch {
        return reject('not-allowed');
      }
    });
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  function diagnose(command: string, code: string, generation: string): void {
    deps.diagnose?.({ time: deps.now(), command, code, generation });
  }

  function generationOf(stamp: Stamp): string {
    return stamp.kind === 'generation' ? stamp.generation : '';
  }

  function publish(record: TeamRecord): void {
    for (const session of sessions.values()) {
      if (!session.open || session.listener === undefined) continue;
      try {
        session.listener(pushed(project(record, session.email), deps.zone()));
      } catch {
        /* A failed push does not undo a finished replace. */
      }
    }
  }

  function pushed(projection: Projection, zone: string): PushedProjection {
    return { ...projection, zone, offsets: offsetsFor(projection, zone) };
  }

  function offsetsFor(projection: Projection, zone: string): Record<string, string> {
    if (projection.access !== 'member') return {};
    const offsets: Record<string, string> = {};
    for (const event of projection.events) {
      offsets[event.start] = deps.labels.offsetAt(zone, event.start);
      offsets[event.end] = deps.labels.offsetAt(zone, event.end);
    }
    return offsets;
  }

  function view(sessionId: string, record: TeamRecord): CommandResult {
    const session = sessions.get(sessionId);
    const email = session?.email;
    const projection = pushed(project(record, email), deps.zone());
    return { ok: true, projection };
  }

  const api: Coordinator = {
    openSession() {
      const id = deps.mintId();
      sessions.set(id, { open: true });
      return id;
    },
    closeSession(sessionId) {
      const session = sessions.get(sessionId);
      if (session === undefined) return;
      session.open = false;
      delete session.listener;
    },
    subscribe(sessionId, listener) {
      const session = sessions.get(sessionId);
      if (session === undefined || !session.open) return;
      session.listener = listener;
    },
    bind(sessionId, requestedEmail) {
      const session = sessions.get(sessionId);
      if (session === undefined || !session.open) return Promise.resolve(reject('unbound-session'));
      return enqueue(() => executeBind(sessionId, requestedEmail));
    },
    command(sessionId, payload) {
      const session = sessions.get(sessionId);
      if (session === undefined || !session.open || session.email === undefined) {
        return Promise.resolve(reject('unbound-session'));
      }
      const parsed = parseCommand(payload);
      if (parsed === undefined) return Promise.resolve(reject('not-allowed'));
      let loaded: LoadResult;
      try {
        loaded = deps.store.load();
      } catch {
        return Promise.resolve(reject('record-unreadable'));
      }
      if (loaded.kind === 'unreadable') return Promise.resolve(reject('record-unreadable'));
      const stamp: Stamp =
        loaded.kind === 'absent'
          ? { kind: 'absent' }
          : { kind: 'generation', generation: loaded.record.generation };
      const email = session.email;
      return enqueue(() => execute(sessionId, email, stamp, parsed));
    },
    focusWriter() {
      writer = true;
      try {
        writerListener?.();
      } catch {
        /* The notice is local to this process. */
      }
    },
    get writer() {
      return writer;
    },
    onWriter(listener) {
      writerListener = listener;
    },
  };

  function executeBind(sessionId: string, requestedEmail: string): CommandResult {
    const session = sessions.get(sessionId);
    if (session === undefined || !session.open) return reject('unbound-session');
    let loaded: LoadResult;
    try {
      loaded = deps.store.load();
    } catch {
      return reject('record-unreadable');
    }
    if (loaded.kind === 'unreadable') return reject('record-unreadable');
    const record: TeamRecord = loaded.kind === 'absent' ? { status: 'absent' } : loaded.record;
    const canonical = canonicalize(requestedEmail);
    if (record.status === 'absent' || record.status === 'dissolved') {
      if (!canonical.ok) {
        diagnose('bind', 'unusable-email', record.status === 'dissolved' ? record.generation : '');
        return reject('unusable-email');
      }
      session.email = canonical.email;
      publish(record);
      return view(sessionId, record);
    }
    const allowed =
      canonical.ok &&
      (record.roster.some((entry) => entry.email === canonical.email) ||
        record.invites.some((entry) => entry.email === canonical.email));
    if (!allowed) {
      diagnose('bind', 'bind-rejected', record.generation);
      return reject('bind-rejected');
    }
    session.email = canonical.email;
    publish(record);
    return view(sessionId, record);
  }

  function execute(
    sessionId: string,
    email: string,
    stamp: Stamp,
    command: RendererCommand,
  ): CommandResult {
    let loaded: LoadResult;
    try {
      loaded = deps.store.load();
    } catch {
      return reject('record-unreadable');
    }
    if (loaded.kind === 'unreadable') return reject('record-unreadable');
    const record: TeamRecord = loaded.kind === 'absent' ? { status: 'absent' } : loaded.record;
    const blocked = decision(record, stamp, command.name);
    if (blocked !== undefined) {
      diagnose(command.name, blocked, generationOf(stamp));
      return reject(blocked);
    }
    const zone = deps.zone();
    let result: DomainResult;
    try {
      result = runDomain(record, email, stamp, zone, command);
    } catch {
      diagnose(command.name, 'not-allowed', generationOf(stamp));
      return reject('not-allowed');
    }
    if (!result.ok && result.code === 'ambiguous-local-time' && result.field !== undefined) {
      diagnose(command.name, result.code, generationOf(stamp));
      return ambiguous(result.field, command, zone, result.code);
    }
    if (!result.ok) {
      diagnose(command.name, result.code, generationOf(stamp));
      return reject(result.code, result.field);
    }
    if (result.record.status === 'absent') return reject('not-allowed');
    let replaced: { ok: true } | { ok: false; reason: string };
    try {
      replaced = deps.store.replace(result.record);
    } catch {
      diagnose(command.name, 'replace-failed', generationOf(stamp));
      return reject('replace-failed');
    }
    if (!replaced.ok) {
      const code = replaced.reason === 'unreadable' ? 'record-unreadable' : 'replace-failed';
      diagnose(command.name, code, generationOf(stamp));
      return reject(code);
    }
    publish(result.record);
    return view(sessionId, result.record);
  }

  function ambiguous(
    field: 'start' | 'end',
    command: RendererCommand,
    zone: string,
    code: string,
  ): CommandResult {
    const civil = clockOf(command, field);
    const earlier = civil === undefined ? undefined : deps.time.convert(zone, civil, 'earlier');
    const later = civil === undefined ? undefined : deps.time.convert(zone, civil, 'later');
    return reject(
      code,
      field,
      earlier?.ok === true ? earlier.instant : undefined,
      later?.ok === true ? later.instant : undefined,
    );
  }

  function runDomain(
    record: TeamRecord,
    email: string,
    stamp: Stamp,
    zone: string,
    command: RendererCommand,
  ): DomainResult {
    const context = { actorEmail: email, stamp, zone, time: deps.time };
    switch (command.name) {
      case 'createTeam':
        return domain.createTeam(record, { ...context, generation: deps.mintId() });
      case 'invite':
        return domain.invite(record, { ...context, email: command.email });
      case 'cancelInvite':
        return domain.cancelInvite(record, { ...context, email: command.email });
      case 'acceptInvite':
        return domain.acceptInvite(record, context);
      case 'declineInvite':
        return domain.declineInvite(record, context);
      case 'designate':
        return domain.designate(record, { ...context, email: command.email });
      case 'removeMember':
        return domain.removeMember(record, { ...context, email: command.email });
      case 'dissolve':
        return domain.dissolve(record, context);
      case 'createEvent':
        return domain.createEvent(record, {
          ...context,
          eventId: deps.mintId(),
          ...eventFields(command),
        });
      case 'modifyEvent':
        return domain.modifyEvent(record, { ...context, ...modifyFields(command) });
      case 'deleteEvent':
        return domain.deleteEvent(record, { ...context, eventId: command.eventId });
      default:
        return { ok: false, code: 'not-allowed', record };
    }
  }

  return api;
}

function decision(
  record: TeamRecord,
  stamp: Stamp,
  name: RendererCommand['name'],
): string | undefined {
  if (name === 'createTeam') {
    if (stamp.kind === 'absent' && record.status === 'absent') return undefined;
    if (stamp.kind === 'absent') return 'generation-mismatch';
    if (record.status === 'active' && record.generation === stamp.generation)
      return 'team-already-active';
    if (record.status === 'dissolved' && record.generation === stamp.generation) return undefined;
    return 'generation-mismatch';
  }
  if (stamp.kind === 'absent')
    return record.status === 'absent' ? 'not-allowed' : 'generation-mismatch';
  if (record.status === 'absent' || record.generation !== stamp.generation)
    return 'generation-mismatch';
  if (record.status === 'dissolved') return 'dissolved';
  return undefined;
}

function reject(
  code: string,
  field?: 'start' | 'end',
  earlier?: string,
  later?: string,
): CommandResult {
  const result: {
    ok: false;
    code: string;
    field?: 'start' | 'end';
    earlier?: string;
    later?: string;
  } = { ok: false, code };
  if (field !== undefined) result.field = field;
  if (earlier !== undefined) result.earlier = earlier;
  if (later !== undefined) result.later = later;
  return result;
}

function clockOf(command: RendererCommand, field: 'start' | 'end'): CivilTime | undefined {
  if (command.name !== 'createEvent' && command.name !== 'modifyEvent') return undefined;
  return field === 'start' ? command.start : command.end;
}

function eventFields(
  command: Extract<RendererCommand, { name: 'createEvent' }>,
): Omit<Extract<RendererCommand, { name: 'createEvent' }>, 'name'> {
  const fields: Omit<Extract<RendererCommand, { name: 'createEvent' }>, 'name'> = {
    visibility: command.visibility,
    title: command.title,
    start: command.start,
    end: command.end,
  };
  if (command.location !== undefined) fields.location = command.location;
  if (command.description !== undefined) fields.description = command.description;
  if (command.startOccurrence !== undefined) fields.startOccurrence = command.startOccurrence;
  if (command.endOccurrence !== undefined) fields.endOccurrence = command.endOccurrence;
  if (command.recurring !== undefined) fields.recurring = command.recurring;
  if (command.allDay !== undefined) fields.allDay = command.allDay;
  return fields;
}

function modifyFields(
  command: Extract<RendererCommand, { name: 'modifyEvent' }>,
): Omit<Extract<RendererCommand, { name: 'modifyEvent' }>, 'name'> {
  const fields: Omit<Extract<RendererCommand, { name: 'modifyEvent' }>, 'name'> = {
    eventId: command.eventId,
  };
  if (command.visibility !== undefined) fields.visibility = command.visibility;
  if (command.title !== undefined) fields.title = command.title;
  if (command.location !== undefined) fields.location = command.location;
  if (command.description !== undefined) fields.description = command.description;
  if (command.start !== undefined) fields.start = command.start;
  if (command.end !== undefined) fields.end = command.end;
  if (command.startOccurrence !== undefined) fields.startOccurrence = command.startOccurrence;
  if (command.endOccurrence !== undefined) fields.endOccurrence = command.endOccurrence;
  if (command.recurring !== undefined) fields.recurring = command.recurring;
  if (command.allDay !== undefined) fields.allDay = command.allDay;
  return fields;
}

function parseCommand(payload: unknown): RendererCommand | undefined {
  if (!isRecord(payload) || typeof payload.name !== 'string') return undefined;
  switch (payload.name) {
    case 'createTeam':
    case 'acceptInvite':
    case 'declineInvite':
    case 'dissolve':
      return { name: payload.name };
    case 'invite':
    case 'cancelInvite':
    case 'designate':
    case 'removeMember':
      return typeof payload.email === 'string'
        ? { name: payload.name, email: payload.email }
        : undefined;
    case 'deleteEvent':
      return typeof payload.eventId === 'string'
        ? { name: 'deleteEvent', eventId: payload.eventId }
        : undefined;
    case 'createEvent':
      return parseCreate(payload);
    case 'modifyEvent':
      return parseModify(payload);
    default:
      return undefined;
  }
}

function parseCreate(payload: Record<string, unknown>): RendererCommand | undefined {
  const start = civil(payload.start);
  const end = civil(payload.end);
  if (
    !isVisibility(payload.visibility) ||
    typeof payload.title !== 'string' ||
    start === undefined ||
    end === undefined
  ) {
    return undefined;
  }
  const command: Extract<RendererCommand, { name: 'createEvent' }> = {
    name: 'createEvent',
    visibility: payload.visibility,
    title: payload.title,
    start,
    end,
  };
  const location = optionalText(payload.location);
  const description = optionalText(payload.description);
  const startOccurrence = occurrence(payload.startOccurrence);
  const endOccurrence = occurrence(payload.endOccurrence);
  if (location !== undefined) command.location = location;
  if (description !== undefined) command.description = description;
  if (startOccurrence !== undefined) command.startOccurrence = startOccurrence;
  if (endOccurrence !== undefined) command.endOccurrence = endOccurrence;
  if (payload.recurring === true) command.recurring = true;
  if (payload.allDay === true) command.allDay = true;
  return command;
}

function parseModify(payload: Record<string, unknown>): RendererCommand | undefined {
  if (typeof payload.eventId !== 'string') return undefined;
  if (payload.visibility !== undefined && !isVisibility(payload.visibility)) return undefined;
  if (payload.start !== undefined && civil(payload.start) === undefined) return undefined;
  if (payload.end !== undefined && civil(payload.end) === undefined) return undefined;
  const command: Extract<RendererCommand, { name: 'modifyEvent' }> = {
    name: 'modifyEvent',
    eventId: payload.eventId,
  };
  if (isVisibility(payload.visibility)) command.visibility = payload.visibility;
  const title = optionalText(payload.title);
  const location = optionalText(payload.location);
  const description = optionalText(payload.description);
  const start = payload.start === undefined ? undefined : civil(payload.start);
  const end = payload.end === undefined ? undefined : civil(payload.end);
  const startOccurrence = occurrence(payload.startOccurrence);
  const endOccurrence = occurrence(payload.endOccurrence);
  if (title !== undefined) command.title = title;
  if (location !== undefined) command.location = location;
  if (description !== undefined) command.description = description;
  if (start !== undefined) command.start = start;
  if (end !== undefined) command.end = end;
  if (startOccurrence !== undefined) command.startOccurrence = startOccurrence;
  if (endOccurrence !== undefined) command.endOccurrence = endOccurrence;
  if (payload.recurring === true) command.recurring = true;
  if (payload.allDay === true) command.allDay = true;
  return command;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function occurrence(value: unknown): Occurrence | undefined {
  return value === 'earlier' || value === 'later' ? value : undefined;
}

function civil(value: unknown): CivilTime | undefined {
  if (!isRecord(value)) return undefined;
  const { year, month, day, hour, minute } = value;
  if (
    typeof year !== 'number' ||
    typeof month !== 'number' ||
    typeof day !== 'number' ||
    typeof hour !== 'number' ||
    typeof minute !== 'number'
  ) {
    return undefined;
  }
  if (![year, month, day, hour, minute].every((part) => Number.isInteger(part))) return undefined;
  return { year, month, day, hour, minute };
}

function isVisibility(value: unknown): value is Visibility {
  return value === 'team-visible' || value === 'only-self';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function recordOf(loaded: LoadResult): TeamRecord {
  return loaded.kind === 'record' ? loaded.record : { status: 'absent' };
}

export type { ScheduleEvent, StoredRecord };
