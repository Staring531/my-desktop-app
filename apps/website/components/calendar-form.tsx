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
    <Page
      title="My calendar"
      subtitle="A clear view of the events that make up your time."
      links={<CalendarLinks />}
    >
      <section className="calendar-toolbar" aria-label="Calendar date range">
        <div className="toolbar-copy">
          <strong>View your dates</strong>
          <span>Choose the range you want to see.</span>
        </div>
        <form
          className="date-range-form"
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
      </section>
      {groups(occurrences).map((group) => (
        <section className="day-group" key={group.date} aria-label={group.date}>
          <div className="day-heading">
            <h2>{group.date}</h2>
            <span>
              {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
            </span>
          </div>
          {group.items.map((occurrence) => (
            <OccurrenceCard
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
      {body?.result === 'ok' && occurrences.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">
            ◷
          </span>
          <strong>No events in this range</strong>
          <p>Try adjusting the dates above or add a new event.</p>
        </div>
      ) : null}
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}

function OccurrenceCard({
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
    <article className={`event-card event-card--${occurrence.visibility} event-card--${occurrence.state}`}>
      <div className="event-time">
        <span className="event-time-label">
          {occurrence.state === 'scheduled' ? 'Scheduled time' : 'Occurrence status'}
        </span>
        {occurrence.state === 'scheduled' ? (
          <>
            <span className="event-time-value">{occurrence.start}</span>
            <span className="event-time-arrow">to</span>
            <span className="event-time-value">{occurrence.end}</span>
          </>
        ) : (
          <span className="event-time-value">{occurrence.state}</span>
        )}
      </div>
      <div className="event-content">
        <div className="event-heading">
          <h3>{occurrence.title}</h3>
          <div className="event-chips">
            <span className={`status-chip ${occurrence.visibility}`}>{occurrence.visibility}</span>
            <span className={`status-chip ${occurrence.state}`}>{occurrence.state}</span>
          </div>
        </div>
        {occurrence.location === '' ? null : (
          <p className="event-meta">{occurrence.location}</p>
        )}
        {occurrence.description === '' ? null : (
          <p className="event-description">{occurrence.description}</p>
        )}
        {occurrence.displayName === '' ? null : (
          <p className="event-meta">{occurrence.displayName}</p>
        )}
        {series || occurrence.state === 'scheduled' ? (
          <div className="event-actions">
            {series ? (
              <>
                <a className="quiet-link" href={eventHref(occurrence, false)}>
                  Edit series
                </a>
                <a className="quiet-link" href={eventHref(occurrence, true)}>
                  This occurrence
                </a>
              </>
            ) : (
              <a className="quiet-link" href={eventHref(occurrence, false)}>
                Edit event
              </a>
            )}
          </div>
        ) : null}
        {occurrence.state === 'choice_required' ? (
          <fieldset className="choice-panel">
            <legend>Choose one of the returned times</legend>
            <div className="choice-options">
              {occurrence.instants?.map((instant) => (
                <label className="choice-option" key={instant}>
                  <input
                    type="radio"
                    name={choiceKey(occurrence)}
                    value={instant}
                    checked={selected === instant}
                    onChange={() => onSelect(instant)}
                  />
                  <span>{instant}</span>
                </label>
              ))}
            </div>
            <div>
              <CommandButton variant={chosen ? 'primary' : 'quiet'} onClick={onChoose}>
                Submit choice
              </CommandButton>
            </div>
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
