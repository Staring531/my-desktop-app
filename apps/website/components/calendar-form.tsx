'use client';

import { useState } from 'react';
import { sendJson, type ApiBody, type Occurrence } from '../lib/api';
import { CommandButton, Page, Result, SignedLinks, TextField } from './ui';

export function CalendarForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);
  const [selected, setSelected] = useState<Record<string, string>>({});

  async function showRange() {
    if (phase === 'waiting' || from === '' || to === '') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson(`/api/calendar?from=${from}&to=${to}`, 'GET');
    setBody(next);
    setPhase('done');
  }

  async function choose(occurrence: Occurrence) {
    const instant = selected[choiceKey(occurrence)];
    if (phase === 'waiting' || instant === undefined || !occurrence.instants?.includes(instant)) {
      return;
    }
    setPhase('waiting');
    const next = await sendJson(`/api/events/${occurrence.id}/choices`, 'POST', {
      date: occurrence.date,
      instant,
    });
    setBody(next);
    setPhase('done');
  }

  return (
    <Page title="Own Calendar">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void showRange();
        }}
      >
        <TextField label="From" value={from} onChange={setFrom} />
        <TextField label="To" value={to} onChange={setTo} />
        <CommandButton variant="primary" type="submit" disabled={phase === 'waiting'}>
          Show range
        </CommandButton>
      </form>
      {body?.occurrences?.map((occurrence) => (
        <OccurrenceRow
          key={`${occurrence.id}-${occurrence.date}`}
          occurrence={occurrence}
          selected={selected[choiceKey(occurrence)]}
          onSelect={(instant) =>
            setSelected((current) => ({ ...current, [choiceKey(occurrence)]: instant }))
          }
          onChoose={() => void choose(occurrence)}
          disabled={phase === 'waiting'}
        />
      ))}
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
      <SignedLinks />
    </Page>
  );
}

function OccurrenceRow({
  occurrence,
  selected,
  onSelect,
  onChoose,
  disabled,
}: {
  occurrence: Occurrence;
  selected: string | undefined;
  onSelect: (instant: string) => void;
  onChoose: () => void;
  disabled: boolean;
}) {
  const series = occurrence.originalStart !== undefined || occurrence.state !== 'scheduled';
  const chosen = selected !== undefined && occurrence.instants?.includes(selected) === true;
  return (
    <article className="row">
      <p>
        <span className={`mark ${occurrence.visibility}`} />
        {occurrence.visibility}
      </p>
      <p>
        {occurrence.state === 'scheduled' ? null : (
          <span className={`mark ${occurrence.state === 'skipped' ? 'skipped' : 'choice'}`} />
        )}
        {occurrence.state}
      </p>
      <p>{occurrence.title}</p>
      <p>{occurrence.displayName}</p>
      <p className="meta">{occurrence.date}</p>
      <p>{occurrence.location}</p>
      <p>{occurrence.description}</p>
      {occurrence.state === 'scheduled' ? (
        <>
          <p className="meta">{occurrence.start}</p>
          <p className="meta">{occurrence.end}</p>
        </>
      ) : null}
      {occurrence.state === 'choice_required' ? (
        <fieldset>
          <legend>Choice</legend>
          {occurrence.instants?.map((instant) => (
            <label key={instant}>
              <input
                type="radio"
                name={choiceKey(occurrence)}
                value={instant}
                checked={selected === instant}
                onChange={() => onSelect(instant)}
              />
              {instant}
            </label>
          ))}
          <CommandButton variant={chosen ? 'primary' : 'quiet'} onClick={onChoose} disabled={disabled}>
            Submit choice
          </CommandButton>
        </fieldset>
      ) : null}
      {series ? (
        <>
          <a className="quiet-link" href={eventHref(occurrence, false)}>
            Series
          </a>
          <a className="quiet-link" href={eventHref(occurrence, true)}>
            This occurrence
          </a>
        </>
      ) : (
        <a className="quiet-link" href={eventHref(occurrence, false)}>
          Event
        </a>
      )}
    </article>
  );
}

function choiceKey(occurrence: Occurrence): string {
  return `${occurrence.id}:${occurrence.date}`;
}

function eventHref(occurrence: Occurrence, oneOccurrence: boolean): string {
  const params = new URLSearchParams();
  params.set('title', occurrence.title);
  params.set('location', occurrence.location);
  params.set('description', occurrence.description);
  params.set('visibility', occurrence.visibility);
  if (occurrence.start !== undefined) {
    params.set('start', occurrence.start);
  }
  if (occurrence.end !== undefined) {
    params.set('end', occurrence.end);
  }
  if (oneOccurrence) {
    const original = occurrence.originalStart ?? occurrence.start;
    if (original !== undefined) {
      params.set('originalStart', original);
    }
  }
  return `/events/${occurrence.id}?${params.toString()}`;
}
