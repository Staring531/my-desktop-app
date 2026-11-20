import { useEffect, useState, type JSX, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  applyProjection,
  applyResult,
  armConfirmation,
  board,
  chooseOccurrence,
  clockLabel,
  confirmArmed,
  discardEditor,
  editDraft,
  escape,
  initialState,
  mayEdit,
  openCreate,
  openEdit,
  requestBind,
  requestCommand,
  requestInvite,
  saveEditor,
  type Effect,
  type UiState,
} from './model.js';

export function App(): JSX.Element {
  const [state, setState] = useState(() => initialState(new Date().toISOString()));

  useEffect(() => {
    const desktop = window.desktop;
    if (desktop === undefined) return undefined;
    const stopProjection = desktop.onProjection((projection) => {
      setState((current) => applyProjection({ ...current, bound: current.bound }, projection));
    });
    const stopWriter = desktop.onWriter(() =>
      setState((current) => ({ ...current, writer: true })),
    );
    const onKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      setState((current) => escape(current).state);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      stopProjection();
      stopWriter();
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  async function run(next: { state: UiState; effect: Effect }): Promise<void> {
    setState(next.state);
    if (next.effect.type === 'none') return;
    const desktop = window.desktop;
    if (next.effect.type === 'open-session') {
      await desktop.openSession();
      return;
    }
    try {
      const result =
        next.effect.type === 'bind'
          ? await desktop.bind(next.effect.requestedEmail)
          : await desktop.command(next.effect.command);
      setState((current) => applyResult(current, result));
    } catch {
      setState((current) => {
        const recovered = { ...current };
        delete recovered.pending;
        return recovered;
      });
    }
  }

  const openAnother = (
    <button
      className="quiet"
      type="button"
      onClick={() => void run({ state, effect: { type: 'open-session' } })}
    >
      Open another session
    </button>
  );
  const shellRow = (
    <div className="shell-row">
      <strong className="app-name">My Desktop App</strong>
      {state.projection?.access === 'member' ? (
        <span className="meta zone-label">{state.projection.zone}</span>
      ) : null}
      <span className="shell-spacer" />
      {openAnother}
    </div>
  );

  return (
    <div className="shell">
      {state.screen !== 'S-01' ? shellRow : null}
      {state.writer ? (
        <div className="notice">
          <p>A writer already exists.</p>
          <button
            className="quiet"
            type="button"
            onClick={() => setState({ ...state, writer: false })}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <div className="surface">
        <Surface state={state} run={run} />
        {state.code !== undefined ? (
          <p className="alert" role="alert" id="result">
            {state.code}
            {state.field !== undefined ? ` ${state.field}` : ''}
          </p>
        ) : null}
      </div>
      {state.screen === 'S-01' ? shellRow : null}
    </div>
  );
}

function Surface({
  state,
  run,
}: {
  state: UiState;
  run: (next: { state: UiState; effect: Effect }) => Promise<void>;
}): JSX.Element {
  if (state.screen === 'S-07')
    return (
      <>
        <h1>This team record cannot be read.</h1>
        <p className="secondary">No replacement team is created.</p>
      </>
    );
  if (state.screen === 'S-01') return <Bind state={state} run={run} />;
  if (state.screen === 'S-02') return <CreateTeam state={state} run={run} />;
  if (state.screen === 'S-03') return <Invite state={state} run={run} />;
  if (state.screen === 'S-04')
    return (
      <>
        <h1>No team access</h1>
        <p className="secondary">{state.boundEmail ?? ''} cannot see this team.</p>
      </>
    );
  if (state.screen === 'S-06' && state.editor !== undefined)
    return <EventEditor state={state} run={run} />;
  return <Workspace state={state} run={run} />;
}

function Bind({
  state,
  run,
}: {
  state: UiState;
  run: (next: { state: UiState; effect: Effect }) => Promise<void>;
}): JSX.Element {
  return (
    <>
      <h1>Bind this session</h1>
      <label>
        Email
        <input
          aria-describedby={state.code ? 'result' : undefined}
          className={
            state.code === 'unusable-email' || state.code === 'bind-rejected'
              ? 'danger-field'
              : undefined
          }
          value={state.emailDraft}
          onChange={(event) =>
            run({ state: { ...state, emailDraft: event.target.value }, effect: { type: 'none' } })
          }
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            void run(requestBind(state));
          }}
        />
      </label>
      <button className="primary" type="button" onClick={() => void run(requestBind(state))}>
        {state.pending === 'Binding' ? 'Binding' : 'Bind'}
      </button>
    </>
  );
}

function CreateTeam({
  state,
  run,
}: {
  state: UiState;
  run: (next: { state: UiState; effect: Effect }) => Promise<void>;
}): JSX.Element {
  return (
    <>
      <h1>Create the team</h1>
      <p>This session is {state.boundEmail ?? ''}</p>
      <button
        className="primary"
        type="button"
        onClick={() => void run(requestCommand(state, { name: 'createTeam' }, 'Creating'))}
      >
        {state.pending === 'Creating' ? 'Creating' : 'Create team'}
      </button>
    </>
  );
}

function Invite({
  state,
  run,
}: {
  state: UiState;
  run: (next: { state: UiState; effect: Effect }) => Promise<void>;
}): JSX.Element {
  const email = state.projection?.access === 'invite' ? state.projection.invite.email : '';
  return (
    <>
      <h1>Invitation</h1>
      <p>{email}</p>
      <button
        className="primary"
        type="button"
        onClick={() => void run(requestCommand(state, { name: 'acceptInvite' }, 'Accepting'))}
      >
        {state.pending === 'Accepting' ? 'Accepting' : 'Accept'}
      </button>
      <button
        className="quiet"
        type="button"
        onClick={() => void run(requestCommand(state, { name: 'declineInvite' }, 'Declining'))}
      >
        {state.pending === 'Declining' ? 'Declining' : 'Decline'}
      </button>
    </>
  );
}

function Workspace({
  state,
  run,
}: {
  state: UiState;
  run: (next: { state: UiState; effect: Effect }) => Promise<void>;
}): JSX.Element {
  const projection = state.projection?.access === 'member' ? state.projection : undefined;
  if (projection === undefined) return <h1>Team workspace</h1>;
  const rows = board(state);
  return (
    <>
      <h1>Team</h1>
      <button
        className="quiet"
        type="button"
        onClick={() =>
          run({
            state: { ...state, viewedInstant: new Date().toISOString() },
            effect: { type: 'none' },
          })
        }
      >
        Now
      </button>
      <p className="meta">Showing {clockLabel(state.viewedInstant, projection.zone)}</p>
      <h2 className="region-title">Members</h2>
      {projection.roster.map((entry) => {
        const busy = rows.find((row) => row.email === entry.email)?.busy === true;
        const confirming =
          state.confirmation?.kind === 'remove' && state.confirmation.email === entry.email;
        return (
          <div className="row" key={entry.email}>
            <span className={busy ? 'mark filled' : 'mark'} />
            <span>{busy ? 'Busy' : 'Free'}</span>
            <span>{entry.email}</span>
            {projection.isMaintainer && entry.email !== projection.actorEmail ? (
              <button
                className="quiet"
                type="button"
                onClick={() =>
                  void run(
                    requestCommand(
                      state,
                      { name: 'designate', email: entry.email },
                      'Making maintainer',
                    ),
                  )
                }
              >
                {state.pending === 'Making maintainer' ? 'Making maintainer' : 'Make maintainer'}
              </button>
            ) : null}
            {projection.isMaintainer && entry.email !== projection.actorEmail ? (
              confirming ? (
                <Confirm
                  question={`Remove ${entry.email}?`}
                  verb="Remove"
                  pending={state.pending}
                  onCancel={() =>
                    void run({ state: withoutConfirmation(state), effect: { type: 'none' } })
                  }
                  onConfirm={() => void run(confirmArmed(state))}
                />
              ) : (
                <button
                  className="danger"
                  type="button"
                  onClick={() =>
                    void run(armConfirmation(state, { kind: 'remove', email: entry.email }))
                  }
                >
                  Remove
                </button>
              )
            ) : null}
          </div>
        );
      })}
      <h2 className="region-title">Events</h2>
      {projection.events.map((event) => (
        <div className="row event" key={event.id}>
          <span className={event.visibility === 'team-visible' ? 'mark filled' : 'mark'} />
          <span>{event.visibility === 'team-visible' ? 'Team' : 'Only you'}</span>
          <span>{event.title}</span>
          <span>{event.location}</span>
          <span>{event.description}</span>
          <span className="meta">
            {clockLabel(event.start, projection.zone)} – {clockLabel(event.end, projection.zone)}
          </span>
          {event.visibility === 'team-visible' ? (
            <span className="meta">{event.ownerEmail}</span>
          ) : null}
          <button
            className="quiet"
            type="button"
            onClick={() =>
              run({ state: { ...state, viewedInstant: event.start }, effect: { type: 'none' } })
            }
          >
            At start
          </button>
          <button
            className="quiet"
            type="button"
            onClick={() =>
              run({ state: { ...state, viewedInstant: event.end }, effect: { type: 'none' } })
            }
          >
            At end
          </button>
          {mayEdit(projection, event) ? (
            <button
              className="quiet"
              type="button"
              onClick={() => run({ state: openEdit(state, event.id), effect: { type: 'none' } })}
            >
              Edit
            </button>
          ) : null}
        </div>
      ))}
      {projection.events.length === 0 ? (
        <p className="secondary">No events</p>
      ) : null}
      <button
        className="primary"
        type="button"
        onClick={() => run({ state: openCreate(state), effect: { type: 'none' } })}
      >
        New event
      </button>
      {projection.isMaintainer && projection.invites.length > 0 ? (
        <>
          <h2 className="region-title">Pending invites</h2>
          {projection.invites.map((invite) => (
            <div className="row" key={invite.email}>
              <span>{invite.email}</span>
              <button
                className="quiet"
                type="button"
                onClick={() =>
                  void run(
                    requestCommand(
                      state,
                      { name: 'cancelInvite', email: invite.email },
                      'Canceling',
                    ),
                  )
                }
              >
                {state.pending === 'Canceling' ? 'Canceling' : 'Cancel invite'}
              </button>
            </div>
          ))}
        </>
      ) : null}
      {projection.isMaintainer ? (
        <>
        <h2 className="region-title">Invite</h2>
        <div className="inline">
          <label>
            Invite email
            <input
              value={state.inviteDraft}
              onChange={(event) =>
                run({
                  state: { ...state, inviteDraft: event.target.value },
                  effect: { type: 'none' },
                })
              }
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                void run(requestInvite(state));
              }}
            />
          </label>
          <button className="quiet" type="button" onClick={() => void run(requestInvite(state))}>
            {state.pending === 'Inviting' ? 'Inviting' : 'Invite'}
          </button>
        </div>
        </>
      ) : null}
      {projection.roster.length === 1 ? (
        state.confirmation?.kind === 'dissolve' ? (
          <Confirm
            question="Dissolve this team?"
            verb="Dissolve"
            pending={state.pending}
            onCancel={() =>
              void run({ state: withoutConfirmation(state), effect: { type: 'none' } })
            }
            onConfirm={() => void run(confirmArmed(state))}
          />
        ) : (
          <button
            className="danger"
            type="button"
            onClick={() => void run(armConfirmation(state, { kind: 'dissolve' }))}
          >
            Dissolve
          </button>
        )
      ) : null}
    </>
  );
}

function EventEditor({
  state,
  run,
}: {
  state: UiState;
  run: (next: { state: UiState; effect: Effect }) => Promise<void>;
}): JSX.Element {
  const editor = state.editor;
  if (editor === undefined) return <h1>One event</h1>;
  const zone = state.projection?.zone ?? '';
  return (
    <>
      <h1>{editor.eventId === undefined ? 'New event' : 'Edit event'}</h1>
      <p className="meta">{zone}</p>
      {editor.custody ? (
        <p>Team</p>
      ) : (
        <div className="choice" role="radiogroup" aria-label="Visibility">
          <label>
            <input
              type="radio"
              name="visibility"
              checked={editor.visibility === 'team-visible'}
              onChange={() =>
                run({
                  state: editDraft(state, { visibility: 'team-visible' }),
                  effect: { type: 'none' },
                })
              }
            />
            Team
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              checked={editor.visibility === 'only-self'}
              onChange={() =>
                run({
                  state: editDraft(state, { visibility: 'only-self' }),
                  effect: { type: 'none' },
                })
              }
            />
            Only you
          </label>
        </div>
      )}
      <label>
        Title
        <input
          value={editor.title}
          onChange={(event) =>
            run({
              state: editDraft(state, { title: event.target.value }),
              effect: { type: 'none' },
            })
          }
          onKeyDown={(event) => activateSave(event, state, run)}
        />
      </label>
      <label>
        Location
        <input
          value={editor.location}
          onChange={(event) =>
            run({
              state: editDraft(state, { location: event.target.value }),
              effect: { type: 'none' },
            })
          }
          onKeyDown={(event) => activateSave(event, state, run)}
        />
      </label>
      <label>
        Description
        <textarea
          value={editor.description}
          onChange={(event) =>
            run({
              state: editDraft(state, { description: event.target.value }),
              effect: { type: 'none' },
            })
          }
        />
      </label>
      <Clock
        label="Start"
        text={editor.startText}
        edited={editor.startEdited || editor.eventId === undefined}
        field="start"
        state={state}
        run={run}
      />
      <Clock
        label="End"
        text={editor.endText}
        edited={editor.endEdited || editor.eventId === undefined}
        field="end"
        state={state}
        run={run}
      />
      {editor.prompt !== undefined ? (
        <div className="choice" role="radiogroup" aria-label={editor.prompt.field}>
          <label>
            <input
              type="radio"
              name="occurrence"
              checked={editor.occurrence?.choice === 'earlier'}
              onChange={() =>
                run({ state: chooseOccurrence(state, 'earlier'), effect: { type: 'none' } })
              }
            />
            Earlier {clockLabel(editor.prompt.earlier, zone)}
          </label>
          <label>
            <input
              type="radio"
              name="occurrence"
              checked={editor.occurrence?.choice === 'later'}
              onChange={() =>
                run({ state: chooseOccurrence(state, 'later'), effect: { type: 'none' } })
              }
            />
            Later {clockLabel(editor.prompt.later, zone)}
          </label>
        </div>
      ) : null}
      <button className="primary" type="button" onClick={() => void run(saveEditor(state))}>
        {state.pending === 'Saving' ? 'Saving' : 'Save'}
      </button>
      <button className="quiet" type="button" onClick={() => void run(discardEditor(state))}>
        Cancel
      </button>
      {editor.eventId !== undefined ? (
        state.confirmation?.kind === 'delete' ? (
          <Confirm
            question={`Delete ${editor.title}?`}
            verb="Delete"
            pending={state.pending}
            onCancel={() =>
              void run({ state: withoutConfirmation(state), effect: { type: 'none' } })
            }
            onConfirm={() => void run(confirmArmed(state))}
          />
        ) : (
          <button
            className="danger"
            type="button"
            onClick={() =>
              void run(
                armConfirmation(state, {
                  kind: 'delete',
                  eventId: editor.eventId ?? '',
                  title: editor.title,
                }),
              )
            }
          >
            Delete
          </button>
        )
      ) : null}
    </>
  );
}

function Clock({
  label,
  text,
  edited,
  field,
  state,
  run,
}: {
  label: string;
  text: string;
  edited: boolean;
  field: 'start' | 'end';
  state: UiState;
  run: (next: { state: UiState; effect: Effect }) => Promise<void>;
}): JSX.Element {
  if (!edited && state.editor?.eventId !== undefined) {
    return (
      <div>
        <p>{label}</p>
        <p>{text}</p>
        <button
          className="quiet"
          type="button"
          onClick={() =>
            run({
              state: editDraft(state, field === 'start' ? { startText: '' } : { endText: '' }),
              effect: { type: 'none' },
            })
          }
        >
          {field === 'start' ? 'Change start' : 'Change end'}
        </button>
      </div>
    );
  }
  return (
    <label>
      {label}
      <input
        className={
          state.code === 'invalid-local-time' && state.field === field ? 'danger-field' : undefined
        }
        aria-describedby={state.field === field ? 'result' : undefined}
        value={text}
        placeholder="YYYY-MM-DD HH:mm"
        onChange={(event) =>
          run({
            state: editDraft(
              state,
              field === 'start'
                ? { startText: event.target.value }
                : { endText: event.target.value },
            ),
            effect: { type: 'none' },
          })
        }
      />
    </label>
  );
}

function Confirm({
  question,
  verb,
  pending,
  onCancel,
  onConfirm,
}: {
  question: string;
  verb: string;
  pending: string | undefined;
  onCancel: () => void;
  onConfirm: () => void;
}): JSX.Element {
  const pendingVerb =
    verb === 'Remove' ? 'Removing' : verb === 'Delete' ? 'Deleting' : 'Dissolving';
  return (
    <div>
      <p>{question}</p>
      <button className="danger" type="button" onClick={onConfirm}>
        {pending === pendingVerb ? pendingVerb : verb}
      </button>
      <button className="quiet" type="button" autoFocus onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

function activateSave(
  event: ReactKeyboardEvent<HTMLInputElement>,
  state: UiState,
  run: (next: { state: UiState; effect: Effect }) => Promise<void>,
): void {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  void run(saveEditor(state));
}

function withoutConfirmation(state: UiState): UiState {
  const next = { ...state };
  delete next.confirmation;
  return next;
}
