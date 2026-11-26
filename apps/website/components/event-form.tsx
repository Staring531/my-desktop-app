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
      <Page title="Event" subtitle="This event is not available." links={<EventLinks />}>
        <Result phase="done" body={body} />
      </Page>
    );
  }

  return (
    <Page
      title={creating ? 'Create an event' : occurrence ? 'Edit this occurrence' : 'Edit event'}
      subtitle={
        creating
          ? 'Add the details, choose when it happens, and decide who can see it.'
          : 'Update the details of this event.'
      }
      links={<EventLinks />}
    >
      <form
        className="event-editor"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <section className="form-card">
          <div className="section-heading">
            <span className="section-number">01</span>
            <div className="section-heading-copy">
              <h2>Event details</h2>
              <p>Give this event a name and a little context.</p>
            </div>
          </div>
          <TextField label="Title" value={title} onChange={setTitle} />
          <div className="field-grid">
            <TextField label="Start date" value={startDate} onChange={setStartDate} />
            <TextField label="Start time" value={startTime} onChange={setStartTime} />
            <TextField label="End date" value={endDate} onChange={setEndDate} />
            <TextField label="End time" value={endTime} onChange={setEndTime} />
          </div>
          <TextField label="Location" value={location} onChange={setLocation} />
          <TextField
            label="Description"
            value={description}
            onChange={setDescription}
            multiline
          />
          {draft.start !== '' || draft.end !== '' ? (
            <div className="stored-times">
              {draft.start !== '' ? <p>Current start: {draft.start}</p> : null}
              {draft.end !== '' ? <p>Current end: {draft.end}</p> : null}
            </div>
          ) : null}
        </section>

        <section className="form-card">
          <div className="section-heading">
            <span className="section-number">02</span>
            <div className="section-heading-copy">
              <h2>Visibility</h2>
              <p>Choose whether this event is public or private.</p>
            </div>
          </div>
          <fieldset className="segmented-options">
            <legend>Who can see this event?</legend>
            <label className="segment-option">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              />
              <span>Private</span>
            </label>
            <label className="segment-option">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              <span>Public</span>
            </label>
          </fieldset>
        </section>

        {creating ? (
          <section className="form-card">
            <div className="section-heading">
              <span className="section-number">03</span>
              <div className="section-heading-copy">
                <h2>Repetition</h2>
                <p>Keep this event on your calendar on a regular basis.</p>
              </div>
            </div>
            <fieldset className="segmented-options">
              <legend>How often should it repeat?</legend>
              {REPETITIONS.map(([value, label]) => (
                <label className="segment-option" key={value}>
                  <input
                    type="radio"
                    name="repetition"
                    checked={repetition === value}
                    onChange={() => setRepetition(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
          </section>
        ) : null}

        {body?.result === 'save_rejected' && body.instants?.length === 2 ? (
          <section className="form-card">
            <div className="section-heading">
              <span className="section-number">!</span>
              <div className="section-heading-copy">
                <h2>Choose a start time</h2>
                <p>Select one of the two times returned by the calendar.</p>
              </div>
            </div>
            <fieldset className="segmented-options">
              <legend>Available instants</legend>
              {body.instants.map((instant) => (
                <label className="segment-option" key={instant}>
                  <input
                    type="radio"
                    name="chosenStart"
                    checked={chosenStart === instant}
                    onChange={() => setChosenStart(instant)}
                  />
                  <span>{instant}</span>
                </label>
              ))}
            </fieldset>
          </section>
        ) : null}

        <div className="event-editor-actions">
          <CommandButton
            variant={creating && repetition === undefined ? 'quiet' : 'primary'}
            type="submit"
          >
            Save
          </CommandButton>
          <a className="quiet-link" href="/calendar">
            Cancel
          </a>
        </div>
      </form>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
      {creating ? null : (
        <section className="security-card">
          <h2>Delete event</h2>
          <p>Deleting an event cannot be undone.</p>
          {confirming === undefined ? (
            <div className="security-actions">
              <CommandButton variant="quiet" className="danger-quiet" onClick={() => setConfirming('event')}>
                Delete event
              </CommandButton>
              {occurrence ? (
                <CommandButton variant="quiet" className="danger-quiet" onClick={() => setConfirming('occurrence')}>
                  Delete this occurrence
                </CommandButton>
              ) : null}
            </div>
          ) : (
            <div
              className="confirm"
              onKeyDown={(event) => {
                if (event.key === 'Escape' && phase !== 'waiting') {
                  setConfirming(undefined);
                }
              }}
            >
              <p>{confirming === 'occurrence' ? 'Delete this occurrence?' : 'Delete the event?'}</p>
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
        </section>
      )}
    </Page>
  );
}
