'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { sendJson, type ApiBody } from '../lib/api';
import { LoginForm } from './auth-forms';
import { CalendarForm } from './calendar-form';
import { EventForm, type EventDraft } from './event-form';
import { AccountLinks, CommandButton, Page, Result, TextField } from './ui';

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
      <Page
        variant="auth"
        title="Checking your session"
        subtitle="Just a moment while we open your personal space."
        links={null}
      >
        <p className="waiting" role="status" aria-live="polite">
          waiting
        </p>
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
    <Page
      title="Account"
      subtitle="Manage the details and timezone for your personal calendar."
      links={<AccountLinks />}
    >
      <section className="settings-card">
        <div className="section-heading">
          <span className="section-number">01</span>
          <div className="section-heading-copy">
            <h2>Profile</h2>
            <p>Choose the name shown with your public events.</p>
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run('/api/account', 'PATCH', { nickname });
          }}
        >
          <TextField label="Nickname" value={nickname} onChange={setNickname} />
          <div className="form-actions">
            <CommandButton variant="primary" type="submit">
              Save nickname
            </CommandButton>
          </div>
        </form>
      </section>

      <section className="settings-card">
        <div className="section-heading">
          <span className="section-number">02</span>
          <div className="section-heading-copy">
            <h2>Calendar timezone</h2>
            <p>Event entry, repetition, and displayed times use this timezone.</p>
          </div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run('/api/account/timezone', 'PATCH', { timezone });
          }}
        >
          <TextField label="Timezone" value={timezone} onChange={setTimezone} />
          <div className="form-actions">
            <CommandButton variant="primary" type="submit">
              Save timezone
            </CommandButton>
          </div>
        </form>
      </section>

      <section className="security-card">
        <h2>Security and access</h2>
        <p>Sign out of this session or permanently delete your account and its calendar.</p>
        <div className="security-actions">
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
              <p>Delete the account and its calendar?</p>
              <CommandButton
                variant="primary"
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
            <CommandButton
              variant="quiet"
              className="danger-quiet"
              onClick={() => setConfirming(true)}
            >
              Delete account
            </CommandButton>
          )}
        </div>
      </section>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}
