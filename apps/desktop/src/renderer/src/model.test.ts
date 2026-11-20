import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PushedProjection } from '../../contract/api.js';
import {
  applyResult,
  armConfirmation,
  board,
  cancelConfirmation,
  chooseOccurrence,
  clockLabel,
  confirmArmed,
  discardEditor,
  editDraft,
  initialState,
  openCreate,
  requestBind,
  requestCommand,
  requestInvite,
  saveEditor,
  type UiState,
} from './model.js';

const now = '2026-01-02T12:00:00.000Z';

function member(): Extract<PushedProjection, { access: 'member' }> {
  return {
    record: 'active',
    access: 'member',
    actorEmail: 'sam@team.com',
    isMaintainer: true,
    zone: 'America/New_York',
    offsets: {
      '2026-01-15T17:00:00.000Z': '-05:00',
      '2026-07-15T16:00:00.000Z': '-04:00',
      '2026-01-02T09:00:00.000Z': '-05:00',
      '2026-01-02T10:00:00.000Z': '-05:00',
    },
    roster: [{ email: 'sam@team.com' }, { email: 'ada@team.com' }],
    invites: [],
    events: [
      {
        id: 'e1',
        ownerEmail: 'sam@team.com',
        visibility: 'team-visible',
        title: 'HQ',
        location: 'Room',
        description: 'line\n two',
        start: '2026-01-02T09:00:00.000Z',
        end: '2026-01-02T10:00:00.000Z',
      },
    ],
  };
}

describe('renderer interactions', () => {
  it('formats instants as local wall-clock labels with the correct DST offset', () => {
    expect(clockLabel('2026-01-15T17:00:00.000Z', 'America/New_York')).toBe('2026-01-15 12:00 -05:00');
    expect(clockLabel('2026-07-15T16:00:00.000Z', 'America/New_York')).toBe('2026-07-15 12:00 -04:00');
    expect(clockLabel('2026-11-01T05:30:00.000Z', 'America/New_York')).toBe('2026-11-01 01:30 -04:00');
    expect(clockLabel('2026-11-01T06:30:00.000Z', 'America/New_York')).toBe('2026-11-01 01:30 -05:00');
  });

  it('binds, creates a team, and answers an invite without sending a team write on bind', () => {
    const empty = requestBind(initialState(now));
    expect(empty.effect).toEqual({ type: 'none' });
    expect(empty.state.code).toBe('unusable-email');
    const typed = requestBind({ ...initialState(now), emailDraft: 'Sam@Team.com' });
    expect(typed.effect).toEqual({ type: 'bind', requestedEmail: 'Sam@Team.com' });
    const bound = applyResult(typed.state, {
      ok: true,
      projection: { record: 'absent', access: 'no-access', zone: 'America/New_York', offsets: {} },
    });
    expect(bound.screen).toBe('S-02');
    expect(bound.editor).toBeUndefined();
    const create = requestCommand(bound, { name: 'createTeam' }, 'Creating');
    expect(create.effect).toEqual({ type: 'command', command: { name: 'createTeam' } });
    const invite = applyResult(create.state, {
      ok: true,
      projection: {
        record: 'active',
        access: 'invite',
        invite: { email: 'ada@team.com' },
        zone: 'America/New_York',
        offsets: {},
      },
    });
    const decline = requestCommand(invite, { name: 'declineInvite' }, 'Declining');
    expect(decline.effect).toEqual({ type: 'command', command: { name: 'declineInvite' } });
  });

  it('saves one event, omits an unedited clock, and chooses an occurrence', () => {
    let state: UiState = {
      ...initialState(now),
      bound: true,
      projection: member(),
      screen: 'S-05',
    };
    state = openCreate(state);
    state = editDraft(state, {
      title: 'HQ',
      location: '',
      description: 'line\n two',
      startText: '2026-01-02 09:00',
      endText: '2026-01-02 10:00',
    });
    const missing = saveEditor(state);
    expect(missing.effect.type).toBe('none');
    expect(missing.state.code).toBe('Choose Team or Only you.');
    state = editDraft(missing.state, { visibility: 'team-visible' });
    const saved = saveEditor(state);
    expect(saved.effect).toMatchObject({
      type: 'command',
      command: { name: 'createEvent', visibility: 'team-visible', title: 'HQ' },
    });
    state = { ...initialState(now), bound: true, projection: member(), screen: 'S-05' };
    const edit = saveEditor(
      editDraft(
        {
          ...state,
          screen: 'S-06',
          editor: {
            eventId: 'e1',
            title: 'Clinic',
            location: 'Room',
            description: 'line\n two',
            visibility: 'team-visible',
            custody: false,
            startText: '2026-01-02T09:00:00.000Z -05:00',
            endText: '2026-01-02T10:00:00.000Z -05:00',
            startEdited: false,
            endEdited: true,
          },
        },
        { endText: '2026-01-02 11:00' },
      ),
    );
    if (edit.effect.type !== 'command' || edit.effect.command.name !== 'modifyEvent')
      throw new Error('modify');
    expect(edit.effect.command.end).toEqual({ year: 2026, month: 1, day: 2, hour: 11, minute: 0 });
    expect('start' in edit.effect.command).toBe(false);
    const ambiguous = applyResult(edit.state, {
      ok: false,
      code: 'ambiguous-local-time',
      field: 'end',
      earlier: '2026-11-01T05:30:00.000Z',
      later: '2026-11-01T06:30:00.000Z',
    });
    const chosen = saveEditor(chooseOccurrence(ambiguous, 'later'));
    if (chosen.effect.type !== 'command' || chosen.effect.command.name !== 'modifyEvent')
      throw new Error('choice');
    expect(chosen.effect.command.endOccurrence).toBe('later');
    const dismissed = discardEditor(ambiguous);
    expect(dismissed.effect).toEqual({ type: 'none' });
    expect(dismissed.state.screen).toBe('S-05');
    expect(dismissed.state.editor).toBeUndefined();
  });

  it('does not send remove, delete, or dissolve on the first press', () => {
    const state = {
      ...initialState(now),
      bound: true,
      projection: member(),
      screen: 'S-05' as const,
    };
    const armed = armConfirmation(state, { kind: 'remove', email: 'ada@team.com' });
    expect(armed.effect).toEqual({ type: 'none' });
    expect(confirmArmed(armed.state).effect).toEqual({
      type: 'command',
      command: { name: 'removeMember', email: 'ada@team.com' },
    });
    expect(cancelConfirmation(armed.state).effect).toEqual({ type: 'none' });
    expect(cancelConfirmation(armed.state).state.confirmation).toBeUndefined();
    const dissolve = confirmArmed(
      armConfirmation(
        { ...state, projection: { ...member(), roster: [{ email: 'sam@team.com' }] } },
        { kind: 'dissolve' },
      ).state,
    );
    expect(dissolve.effect).toEqual({ type: 'command', command: { name: 'dissolve' } });
  });

  it('AC-016 and AC-042 call busyAt and label each instant with the supplied offset', () => {
    const projection = member();
    const state = {
      ...initialState('2026-01-02T09:00:00.000Z'),
      bound: true,
      projection,
      screen: 'S-05' as const,
    };
    expect(board(state).find((row) => row.email === 'sam@team.com')?.busy).toBe(true);
    expect(
      board({ ...state, viewedInstant: '2026-01-02T10:00:00.000Z' }).find(
        (row) => row.email === 'sam@team.com',
      )?.busy,
    ).toBe(false);
    expect(clockLabel('2026-01-15T17:00:00.000Z', projection.zone)).toBe(
      '2026-01-15 12:00 -05:00',
    );
    expect(clockLabel('2026-07-15T16:00:00.000Z', projection.zone)).toBe(
      '2026-07-15 12:00 -04:00',
    );
    const empty = requestInvite(state);
    expect(empty.effect.type).toBe('none');
  });
});

describe('renderer imports', () => {
  it('imports busyAt and no domain command writer', () => {
    const root = join(import.meta.dirname, '.');
    const files = walk(root).filter(
      (file) => (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.test.ts'),
    );
    const source = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    const imports = [...source.matchAll(/from ['"]([^'"]+)['"]/gu)].map((match) => match[1] ?? '');
    const domain = imports.filter((item) => item.includes('/domain/'));
    expect(domain).toEqual(['../../domain/project.js']);
    expect(source.includes('createTeam(')).toBe(false);
    expect(source.includes('modifyEvent(')).toBe(false);
  });
});

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
