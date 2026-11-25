'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { sendJson, type ApiBody } from '../lib/api';
import { LoginForm } from './auth-forms';
import { CalendarForm } from './calendar-form';
import { EventForm, type EventDraft } from './event-form';
import { CommandButton, Page, Result, SignedLinks, TextField } from './ui';

export function useSession(): 'checking' | 'in' | 'out' {
  const [session, setSession] = useState<'checking' | 'in' | 'out'>('checking');
  useEffect(() => {
    void sendJson('/api/calendar', 'GET').then((body) => {
      setSession(body.result === 'logged_out' ? 'out' : 'in');
    });
  }, []);
  return session;
}

export function Guarded({
  children,
  onOk,
}: {
  children: (session: 'in') => ReactNode;
  onOk: (path: string) => void;
}) {
  const session = useSession();
  if (session === 'out') {
    return <LoginForm initial={{ result: 'logged_out' }} onOk={onOk} />;
  }
  if (session === 'checking') {
    return (
      <Page title="Log in">
        <p className="waiting">waiting</p>
      </Page>
    );
  }
  return children('in');
}

export function CalendarPage({ onOk }: { onOk: (path: string) => void }) {
  return <Guarded onOk={onOk}>{() => <CalendarForm />}</Guarded>;
}

export function EventPage({ draft, onOk }: { draft: EventDraft; onOk: (path: string) => void }) {
  return <Guarded onOk={onOk}>{() => <EventForm draft={draft} />}</Guarded>;
}

export function AccountPage({ onOk }: { onOk: (path: string) => void }) {
  return <Guarded onOk={onOk}>{() => <AccountForm onOk={onOk} />}</Guarded>;
}

function AccountForm({ onOk }: { onOk: (path: string) => void }) {
  const [nickname, setNickname] = useState('');
  const [timezone, setTimezone] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);

  async function run(path: string, method: string, payload?: unknown, leave = false) {
    if (phase === 'waiting') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson(path, method, payload);
    setBody(next);
    setPhase('done');
    if (leave && next.result === 'ok') {
      onOk('/login');
    }
  }

  if (body?.result === 'logged_out') {
    return <LoginForm initial={body} onOk={onOk} />;
  }

  return (
    <Page title="Account">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run('/api/account', 'PATCH', { nickname });
        }}
      >
        <TextField label="Nickname" value={nickname} onChange={setNickname} />
        <CommandButton variant="primary" type="submit">
          Save nickname
        </CommandButton>
      </form>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run('/api/account/timezone', 'PATCH', { timezone });
        }}
      >
        <TextField label="Timezone" value={timezone} onChange={setTimezone} />
        <CommandButton variant="primary" type="submit">
          Save timezone
        </CommandButton>
      </form>
      <CommandButton
        variant="quiet"
        onClick={() => void run('/api/sessions/current', 'DELETE', undefined, true)}
      >
        Log out
      </CommandButton>
      {confirming ? (
        <div
          className="confirm"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && phase !== 'waiting') {
              setConfirming(false);
            }
          }}
        >
          <p>Delete the account</p>
          <CommandButton
            variant="danger"
            onClick={() => void run('/api/account', 'DELETE', undefined, true)}
          >
            Delete
          </CommandButton>
          <CommandButton
            variant="quiet"
            onClick={() => {
              if (phase !== 'waiting') {
                setConfirming(false);
              }
            }}
          >
            Cancel
          </CommandButton>
        </div>
      ) : (
        <CommandButton variant="quiet" onClick={() => setConfirming(true)}>
          Delete account
        </CommandButton>
      )}
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
      <SignedLinks />
    </Page>
  );
}
