'use client';

import { useState } from 'react';
import { sendJson, type ApiBody } from '../lib/api';
import { CommandButton, EventLinks, Page, Result, TextField } from './ui';

export type EventDraft = {
  id?: string;
  title: string;
  location: string;
  description: string;
  visibility: 'public' | 'private';
  start: string;
  end: string;
  originalStart?: string;
};

const REPETITIONS = [
  ['none', 'non-repeating'],
  ['daily', 'daily'],
  ['weekly', 'weekly'],
  ['monthly', 'monthly'],
] as const;

export function EventForm({ draft }: { draft: EventDraft }) {
  const creating = draft.id === undefined;
  const [title, setTitle] = useState(draft.title);
  const [location, setLocation] = useState(draft.location);
  const [description, setDescription] = useState(draft.description);
  const [visibility, setVisibility] = useState(draft.visibility);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [repetition, setRepetition] = useState<string | undefined>(undefined);
  const [chosenStart, setChosenStart] = useState<string | undefined>(undefined);
  const [confirming, setConfirming] = useState<'event' | 'occurrence' | undefined>(undefined);
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);
  const occurrence = draft.originalStart !== undefined && draft.originalStart !== '';

  async function save() {
    if (phase === 'waiting' || (creating && repetition === undefined)) {
      return;
    }
    const payload: Record<string, unknown> = {
      title,
      location,
      description,
      visibility,
      start: { date: startDate, time: startTime },
      end: { date: endDate, time: endTime },
    };
    if (creating && repetition !== undefined) {
      payload.repetition = repetition;
    }
    if (
      chosenStart !== undefined &&
      body?.instants !== undefined &&
      body.instants.includes(chosenStart)
    ) {
      payload.chosenStart = chosenStart;
    }
    setPhase('waiting');
    const next = occurrence
      ? await sendJson(`/api/events/${draft.id ?? ''}/detach`, 'POST', {
          ...payload,
          originalStart: draft.originalStart,
        })
      : await sendJson(creating ? '/api/events' : `/api/events/${draft.id ?? ''}`, 'PUT', payload);
    setBody(next);
    setChosenStart(undefined);
    setPhase('done');
  }

  async function remove(target: 'event' | 'occurrence') {
    if (phase === 'waiting' || draft.id === undefined) {
      return;
    }
    setPhase('waiting');
    const next =
      target === 'occurrence'
        ? await sendJson(`/api/events/${draft.id}/occurrences`, 'DELETE', {
            originalStart: draft.originalStart,
          })
        : await sendJson(`/api/events/${draft.id}`, 'DELETE');
    setBody(next);
    setPhase('done');
  }

  if (body !== undefined && (body.result === 'logged_out' || body.result === 'not_found')) {
    return (
      <Page title="Event" links={<EventLinks />}>
        <Result phase="done" body={body} />
      </Page>
    );
  }

  return (
    <Page title="Event" links={<EventLinks />}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <TextField label="Title" value={title} onChange={setTitle} />
        <label>
          Start date
          <input
            className="figures"
            aria-label="Start date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label>
          Start time
          <input
            className="figures"
            aria-label="Start time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </label>
        <label>
          End date
          <input
            className="figures"
            aria-label="End date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <label>
          End time
          <input
            className="figures"
            aria-label="End time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </label>
        <TextField label="Location" value={location} onChange={setLocation} />
        <TextField label="Description" value={description} onChange={setDescription} multiline />
        <fieldset>
          <legend>Visibility</legend>
          <label>
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
            />
            private
          </label>
          <label>
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
            />
            public
          </label>
        </fieldset>
        {creating ? (
          <fieldset>
            <legend>Repetition</legend>
            {REPETITIONS.map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="repetition"
                  checked={repetition === value}
                  onChange={() => setRepetition(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        ) : null}
        {body?.result === 'save_rejected' && body.instants?.length === 2 ? (
          <fieldset>
            <legend>Returned instants</legend>
            {body.instants.map((instant) => (
              <label key={instant}>
                <input
                  type="radio"
                  name="chosenStart"
                  checked={chosenStart === instant}
                  onChange={() => setChosenStart(instant)}
                />
                {instant}
              </label>
            ))}
          </fieldset>
        ) : null}
        {draft.start !== '' ? <p className="meta">{draft.start}</p> : null}
        {draft.end !== '' ? <p className="meta">{draft.end}</p> : null}
        <CommandButton
          variant={creating && repetition === undefined ? 'quiet' : 'primary'}
          type="submit"
        >
          Save
        </CommandButton>
      </form>
      <a className="quiet-link" href="/calendar">
        Cancel
      </a>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
      {creating ? null : (
        <div className="region">
          {confirming === undefined ? (
            <>
              <CommandButton variant="quiet" onClick={() => setConfirming('event')}>
                Delete event
              </CommandButton>
              {occurrence ? (
                <CommandButton variant="quiet" onClick={() => setConfirming('occurrence')}>
                  Delete this occurrence
                </CommandButton>
              ) : null}
            </>
          ) : (
            <div
              className="confirm"
              onKeyDown={(event) => {
                if (event.key === 'Escape' && phase !== 'waiting') {
                  setConfirming(undefined);
                }
              }}
            >
              <p>{confirming === 'occurrence' ? 'Delete this occurrence' : 'Delete the event'}</p>
              <CommandButton
                variant="primary"
                onClick={() => {
                  if (confirming !== undefined) {
                    void remove(confirming);
                  }
                }}
              >
                Delete
              </CommandButton>
              <CommandButton
                variant="quiet"
                onClick={() => {
                  if (phase !== 'waiting') {
                    setConfirming(undefined);
                  }
                }}
              >
                Cancel
              </CommandButton>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
