'use client';

import { useState } from 'react';
import { sendJson, type ApiBody, type Occurrence } from '../lib/api';
import { CommandButton, Page, Result, CalendarLinks, TextField } from './ui';

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

  const ready = from !== '' && to !== '';
  const occurrences = body?.occurrences ?? [];

  return (
    <Page title="Own Calendar" links={<CalendarLinks />}>
      <form
        className="tool"
        onSubmit={(event) => {
          event.preventDefault();
          void showRange();
        }}
      >
        <TextField label="From" value={from} onChange={setFrom} />
        <TextField label="To" value={to} onChange={setTo} />
        <CommandButton variant={ready ? 'primary' : 'quiet'} type="submit">
          Show range
        </CommandButton>
      </form>
      {groups(occurrences).map((group) => (
        <section key={group.date}>
          <h2 className="day">{group.date}</h2>
          {group.items.map((occurrence) => (
            <OccurrenceRow
              key={`${occurrence.id}-${occurrence.date}`}
              occurrence={occurrence}
              selected={selected[choiceKey(occurrence)]}
              onSelect={(instant) =>
                setSelected((current) => ({ ...current, [choiceKey(occurrence)]: instant }))
              }
              onChoose={() => void choose(occurrence)}
            />
          ))}
        </section>
      ))}
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}

function OccurrenceRow({
  occurrence,
  selected,
  onSelect,
  onChoose,
}: {
  occurrence: Occurrence;
  selected: string | undefined;
  onSelect: (instant: string) => void;
  onChoose: () => void;
}) {
  const series = occurrence.state === 'scheduled' && occurrence.originalStart !== undefined;
  const chosen = selected !== undefined && occurrence.instants?.includes(selected) === true;
  return (
    <article className="occurrence">
      <p className="facts">
        <span>{occurrence.visibility}</span>
        <span>{occurrence.state}</span>
      </p>
      <div>
        <div className="titleline">
          <h2>{occurrence.title}</h2>
          {series ? (
            <span>
              <a className="quiet-link" href={eventHref(occurrence, false)}>
                Series
              </a>
              <a className="quiet-link" href={eventHref(occurrence, true)}>
                This occurrence
              </a>
            </span>
          ) : occurrence.state === 'scheduled' ? (
            <a className="quiet-link" href={eventHref(occurrence, false)}>
              Event
            </a>
          ) : null}
        </div>
        {occurrence.state === 'scheduled' ? (
          <>
            <p className="meta">{occurrence.start}</p>
            <p className="meta">{occurrence.end}</p>
          </>
        ) : null}
        {occurrence.location === '' ? null : <p className="body">{occurrence.location}</p>}
        {occurrence.description === '' ? null : <p className="body">{occurrence.description}</p>}
        {occurrence.displayName === '' ? null : <p className="meta">{occurrence.displayName}</p>}
        {occurrence.state === 'choice_required' ? (
          <fieldset>
            <legend>Choice</legend>
            {occurrence.instants?.map((instant) => (
              <label className="choice" key={instant}>
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
            <CommandButton variant={chosen ? 'primary' : 'quiet'} onClick={onChoose}>
              Submit choice
            </CommandButton>
          </fieldset>
        ) : null}
      </div>
    </article>
  );
}

function groups(occurrences: Occurrence[]): Array<{ date: string; items: Occurrence[] }> {
  const grouped: Array<{ date: string; items: Occurrence[] }> = [];
  for (const occurrence of occurrences) {
    const current = grouped.find((group) => group.date === occurrence.date);
    if (current === undefined) {
      grouped.push({ date: occurrence.date, items: [occurrence] });
    } else {
      current.items.push(occurrence);
    }
  }
  return grouped;
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
