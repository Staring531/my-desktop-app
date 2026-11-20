import type { PushedProjection, RendererCommand } from '../../contract/api.js';
import { busyAt } from '../../domain/project.js';

type CivilTime = { year: number; month: number; day: number; hour: number; minute: number };
type Occurrence = 'earlier' | 'later';
type Visibility = 'team-visible' | 'only-self';

export type Screen = 'S-01' | 'S-02' | 'S-03' | 'S-04' | 'S-05' | 'S-06' | 'S-07';

export type Editor = {
  eventId?: string;
  title: string;
  location: string;
  description: string;
  visibility?: Visibility;
  custody: boolean;
  startText: string;
  endText: string;
  startEdited: boolean;
  endEdited: boolean;
  occurrence?: { field: 'start' | 'end'; choice: Occurrence };
  prompt?: { field: 'start' | 'end'; earlier: string; later: string };
};

export type Confirmation =
  | { kind: 'remove'; email: string }
  | { kind: 'delete'; eventId: string; title: string }
  | { kind: 'dissolve' };

export type UiState = {
  screen: Screen;
  bound: boolean;
  projection?: PushedProjection;
  emailDraft: string;
  inviteDraft: string;
  editor?: Editor;
  confirmation?: Confirmation;
  code?: string;
  field?: 'start' | 'end';
  pending?: string;
  writer: boolean;
  viewedInstant: string;
  boundEmail?: string;
};

export type Effect =
  | { type: 'none' }
  | { type: 'bind'; requestedEmail: string }
  | { type: 'open-session' }
  | { type: 'command'; command: RendererCommand };

const CLOCK = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/u;

export function initialState(now: string): UiState {
  return {
    screen: 'S-01',
    bound: false,
    emailDraft: '',
    inviteDraft: '',
    writer: false,
    viewedInstant: now,
  };
}

export function clockLabel(instant: string, zone: string): string {
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return instant;
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const part = (type: string): string =>
      parts.find((item) => item.type === type)?.value ?? '';
    const rawOffset = part('timeZoneName');
    const offset = rawOffset.replace(/^GMT/u, '') || '+00:00';
    return part('year') + '-' + part('month') + '-' + part('day') + ' ' +
      part('hour') + ':' + part('minute') + ' ' + offset;
  } catch {
    return instant;
  }
}

export function parseClock(text: string): CivilTime | undefined {
  const match = CLOCK.exec(text);
  if (match === null) return undefined;
  const [, year, month, day, hour, minute] = match;
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    hour === undefined ||
    minute === undefined
  )
    return undefined;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };
}

export function requestBind(state: UiState): { state: UiState; effect: Effect } {
  if (state.pending !== undefined) return { state, effect: { type: 'none' } };
  if (state.emailDraft.trim().length === 0) {
    return { state: { ...state, code: 'unusable-email' }, effect: { type: 'none' } };
  }
  const next = clearResult(state);
  next.pending = 'Binding';
  return { state: next, effect: { type: 'bind', requestedEmail: state.emailDraft } };
}

export function requestInvite(state: UiState): { state: UiState; effect: Effect } {
  if (state.pending !== undefined) return { state, effect: { type: 'none' } };
  if (state.inviteDraft.trim().length === 0) {
    return { state: { ...state, code: 'unusable-email' }, effect: { type: 'none' } };
  }
  const next = clearResult(state);
  next.pending = 'Inviting';
  return {
    state: next,
    effect: { type: 'command', command: { name: 'invite', email: state.inviteDraft } },
  };
}

export function requestCommand(
  state: UiState,
  command: RendererCommand,
  pending: string,
): { state: UiState; effect: Effect } {
  if (state.pending !== undefined) return { state, effect: { type: 'none' } };
  const next = clearResult(state);
  next.pending = pending;
  return { state: next, effect: { type: 'command', command } };
}

export function armConfirmation(
  state: UiState,
  confirmation: Confirmation,
): { state: UiState; effect: Effect } {
  if (state.pending !== undefined) return { state, effect: { type: 'none' } };
  const next = clearResult(state);
  next.confirmation = confirmation;
  return { state: next, effect: { type: 'none' } };
}

export function cancelConfirmation(state: UiState): { state: UiState; effect: Effect } {
  if (state.pending !== undefined) return { state, effect: { type: 'none' } };
  const next = { ...state };
  delete next.confirmation;
  return { state: next, effect: { type: 'none' } };
}

export function confirmArmed(state: UiState): { state: UiState; effect: Effect } {
  if (state.confirmation === undefined) return { state, effect: { type: 'none' } };
  if (state.confirmation.kind === 'remove') {
    return requestCommand(
      state,
      { name: 'removeMember', email: state.confirmation.email },
      'Removing',
    );
  }
  if (state.confirmation.kind === 'delete') {
    return requestCommand(
      state,
      { name: 'deleteEvent', eventId: state.confirmation.eventId },
      'Deleting',
    );
  }
  return requestCommand(state, { name: 'dissolve' }, 'Dissolving');
}

export function openCreate(state: UiState): UiState {
  if (state.projection?.access !== 'member' || state.pending !== undefined) return state;
  const next = clearResult(state);
  delete next.confirmation;
  return {
    ...next,
    screen: 'S-06',
    editor: {
      title: '',
      location: '',
      description: '',
      custody: false,
      startText: '',
      endText: '',
      startEdited: true,
      endEdited: true,
    },
  };
}

export function openEdit(state: UiState, eventId: string): UiState {
  const event = memberEvents(state).find((item) => item.id === eventId);
  const projection = state.projection;
  if (
    event === undefined ||
    projection === undefined ||
    projection.access !== 'member' ||
    !mayEdit(projection, event)
  )
    return state;
  const ownerPresent = projection.roster.some((entry) => entry.email === event.ownerEmail);
  const next = clearResult(state);
  delete next.confirmation;
  return {
    ...next,
    screen: 'S-06',
    editor: {
      eventId: event.id,
      title: event.title,
      location: event.location,
      description: event.description,
      visibility: event.visibility,
      custody: !ownerPresent,
      startText: clockLabel(event.start, projection.zone),
      endText: clockLabel(event.end, projection.zone),
      startEdited: false,
      endEdited: false,
    },
  };
}

export function editDraft(
  state: UiState,
  patch: Partial<
    Pick<Editor, 'title' | 'location' | 'description' | 'visibility' | 'startText' | 'endText'>
  >,
): UiState {
  if (state.editor === undefined) return state;
  const editor = { ...state.editor, ...patch };
  if (patch.startText !== undefined) editor.startEdited = true;
  if (patch.endText !== undefined) editor.endEdited = true;
  return { ...state, editor };
}

export function chooseOccurrence(state: UiState, choice: Occurrence): UiState {
  if (state.editor?.prompt === undefined) return state;
  return {
    ...state,
    editor: { ...state.editor, occurrence: { field: state.editor.prompt.field, choice } },
  };
}

export function discardEditor(state: UiState): { state: UiState; effect: Effect } {
  if (state.pending !== undefined || state.editor === undefined)
    return { state, effect: { type: 'none' } };
  return { state: workspace(state), effect: { type: 'none' } };
}

export function saveEditor(state: UiState): { state: UiState; effect: Effect } {
  const editor = state.editor;
  if (editor === undefined || state.pending !== undefined)
    return { state, effect: { type: 'none' } };
  if (editor.eventId === undefined && editor.visibility === undefined) {
    return { state: { ...state, code: 'Choose Team or Only you.' }, effect: { type: 'none' } };
  }
  const start =
    editor.startEdited || editor.occurrence?.field === 'start'
      ? parseClock(editor.startText)
      : undefined;
  const end =
    editor.endEdited || editor.occurrence?.field === 'end' ? parseClock(editor.endText) : undefined;
  if ((editor.startEdited || editor.occurrence?.field === 'start') && start === undefined) {
    return {
      state: { ...state, code: 'invalid-local-time', field: 'start' },
      effect: { type: 'none' },
    };
  }
  if ((editor.endEdited || editor.occurrence?.field === 'end') && end === undefined) {
    return {
      state: { ...state, code: 'invalid-local-time', field: 'end' },
      effect: { type: 'none' },
    };
  }
  if (editor.eventId === undefined) {
    if (start === undefined || end === undefined || editor.visibility === undefined) {
      return {
        state: {
          ...state,
          code: 'invalid-local-time',
          field: start === undefined ? 'start' : 'end',
        },
        effect: { type: 'none' },
      };
    }
    const command: Extract<RendererCommand, { name: 'createEvent' }> = {
      name: 'createEvent',
      visibility: editor.visibility,
      title: editor.title,
      location: editor.location,
      description: editor.description,
      start,
      end,
    };
    if (editor.occurrence?.field === 'start') command.startOccurrence = editor.occurrence.choice;
    if (editor.occurrence?.field === 'end') command.endOccurrence = editor.occurrence.choice;
    return requestCommand(state, command, 'Saving');
  }
  const command: Extract<RendererCommand, { name: 'modifyEvent' }> = {
    name: 'modifyEvent',
    eventId: editor.eventId,
    title: editor.title,
    location: editor.location,
    description: editor.description,
  };
  if (!editor.custody && editor.visibility !== undefined) command.visibility = editor.visibility;
  if (start !== undefined) command.start = start;
  if (end !== undefined) command.end = end;
  if (editor.occurrence?.field === 'start') command.startOccurrence = editor.occurrence.choice;
  if (editor.occurrence?.field === 'end') command.endOccurrence = editor.occurrence.choice;
  return requestCommand(state, command, 'Saving');
}

export function applyResult(
  state: UiState,
  result:
    | { ok: true; projection: PushedProjection }
    | { ok: false; code: string; field?: 'start' | 'end'; earlier?: string; later?: string },
): UiState {
  if (result.ok) {
    const cleared = clearResult({ ...state, bound: true, emailDraft: '' });
    delete cleared.pending;
    delete cleared.confirmation;
    const next = applyProjection(cleared, result.projection);
    if (state.pending === 'Binding') {
      const bound = { ...next, inviteDraft: '', boundEmail: state.emailDraft };
      delete bound.editor;
      return bound;
    }
    if (
      state.pending === 'Saving' ||
      state.pending === 'Deleting' ||
      state.pending === 'Dissolving'
    ) {
      const saved = { ...next };
      delete saved.editor;
      return saved;
    }
    return next;
  }
  const base = clearResult(state);
  delete base.pending;
  base.code = result.code;
  if (result.field !== undefined) base.field = result.field;
  if (
    result.code === 'ambiguous-local-time' &&
    result.field !== undefined &&
    result.earlier !== undefined &&
    result.later !== undefined &&
    state.editor !== undefined
  ) {
    return {
      ...base,
      screen: 'S-06',
      editor: {
        ...state.editor,
        prompt: { field: result.field, earlier: result.earlier, later: result.later },
      },
    };
  }
  if (result.code === 'record-unreadable') {
    const unreadable = { ...base, screen: 'S-07' as const };
    delete unreadable.editor;
    delete unreadable.confirmation;
    return unreadable;
  }
  return place(base, state.projection);
}

export function applyProjection(state: UiState, projection: PushedProjection): UiState {
  const next = place({ ...state, projection, bound: state.bound }, projection);
  if (state.editor !== undefined && next.screen !== 'S-05' && next.screen !== 'S-06') {
    const replaced = { ...next };
    delete replaced.editor;
    delete replaced.confirmation;
    return replaced;
  }
  if (state.confirmation !== undefined && !confirmationStillAllowed(next, state.confirmation)) {
    const replaced = { ...next };
    delete replaced.confirmation;
    return replaced;
  }
  return next;
}

export function escape(state: UiState): { state: UiState; effect: Effect } {
  if (state.pending !== undefined) return { state, effect: { type: 'none' } };
  if (state.confirmation !== undefined) return cancelConfirmation(state);
  if (state.writer) return { state: { ...state, writer: false }, effect: { type: 'none' } };
  if (state.editor !== undefined) return discardEditor(state);
  return { state, effect: { type: 'none' } };
}

export function board(state: UiState): { email: string; busy: boolean }[] {
  const projection = state.projection;
  if (projection === undefined || projection.access !== 'member') return [];
  return busyAt(projection, projection.actorEmail, state.viewedInstant);
}

export function mayEdit(
  projection: Extract<PushedProjection, { access: 'member' }>,
  event: { id: string; ownerEmail: string; visibility: Visibility },
): boolean {
  const ownerPresent = projection.roster.some((entry) => entry.email === event.ownerEmail);
  if (ownerPresent && event.ownerEmail === projection.actorEmail) return true;
  return !ownerPresent && event.visibility === 'team-visible' && projection.isMaintainer;
}

function memberEvents(state: UiState): {
  id: string;
  ownerEmail: string;
  visibility: Visibility;
  title: string;
  location: string;
  description: string;
  start: string;
  end: string;
}[] {
  return state.projection?.access === 'member' ? state.projection.events : [];
}

function workspace(state: UiState): UiState {
  const next: UiState = {
    ...state,
    screen: state.projection?.access === 'member' ? 'S-05' : state.screen,
  };
  delete next.code;
  delete next.editor;
  delete next.confirmation;
  delete next.field;
  return next;
}

function clearResult(state: UiState): UiState {
  const next = { ...state };
  delete next.code;
  delete next.field;
  return next;
}

function place(state: UiState, projection: PushedProjection | undefined): UiState {
  if (state.screen === 'S-07' || state.code === 'record-unreadable')
    return { ...state, screen: 'S-07' };
  if (!state.bound || projection === undefined) return { ...state, screen: 'S-01' };
  if (projection.record === 'absent' || projection.record === 'dissolved') {
    const next = { ...state, screen: 'S-02' as const };
    delete next.editor;
    return next;
  }
  if (projection.access === 'invite') {
    const next = { ...state, screen: 'S-03' as const };
    delete next.editor;
    return next;
  }
  if (projection.access !== 'member') {
    const next = { ...state, screen: 'S-04' as const };
    delete next.editor;
    return next;
  }
  return { ...state, screen: state.editor === undefined ? 'S-05' : 'S-06' };
}

function confirmationStillAllowed(state: UiState, confirmation: Confirmation): boolean {
  const projection = state.projection;
  if (projection?.access !== 'member') return false;
  if (confirmation.kind === 'dissolve') return projection.roster.length === 1;
  if (confirmation.kind === 'remove')
    return (
      projection.isMaintainer &&
      projection.roster.some((entry) => entry.email === confirmation.email)
    );
  return memberEvents(state).some(
    (event) => event.id === confirmation.eventId && mayEdit(projection, event),
  );
}
