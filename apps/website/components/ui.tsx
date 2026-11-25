import type { ReactNode } from 'react';
import type { ApiBody } from '../lib/api';
import { isFailure } from '../lib/api';

const UNSIGNED = [
  ['/register', 'Register'],
  ['/verify', 'Verify'],
  ['/register/cancel', 'Cancel registration'],
  ['/login', 'Log in'],
  ['/recovery', 'Start recovery'],
  ['/recovery/complete', 'Complete recovery'],
] as const;

export function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="column" aria-labelledby="page-title">
      <h1 id="page-title">{title}</h1>
      {children}
    </main>
  );
}

export function UnsignedLinks() {
  return (
    <nav className="links" aria-label="Account navigation">
      {UNSIGNED.map(([href, label]) => (
        <a className="quiet-link" href={href} key={href}>
          {label}
        </a>
      ))}
    </nav>
  );
}

export function SignedLinks() {
  return (
    <nav className="links" aria-label="Workspace navigation">
      <a className="quiet-link" href="/calendar">
        Calendar
      </a>
      <a className="quiet-link" href="/account">
        Account
      </a>
      <a className="quiet-link" href="/events/new">
        New event
      </a>
    </nav>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'email';
  multiline?: boolean;
  autoComplete?: string;
}) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function CommandButton({
  variant,
  children,
  type = 'button',
  onClick,
  disabled = false,
}: {
  variant: 'primary' | 'quiet' | 'danger';
  children: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className={variant} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Result({ phase, body }: { phase: 'idle' | 'waiting' | 'done'; body?: ApiBody }) {
  if (phase === 'waiting') {
    return (
      <p className="waiting" role="status" aria-live="polite">
        waiting
      </p>
    );
  }
  if (phase !== 'done' || body === undefined) {
    return null;
  }

  const failed = isFailure(body.result);
  return (
    <div
      className={failed ? 'result failure' : 'result'}
      role={failed ? 'alert' : 'status'}
      aria-live={failed ? 'assertive' : 'polite'}
    >
      <p>{body.result}</p>
      {body.monthTypes?.map((month) => (
        <p key={month}>{month}</p>
      ))}
      {body.missingDates?.map((date) => (
        <p key={date}>{date}</p>
      ))}
      {body.conflicts?.map((conflict) => (
        <div className="row" key={`${conflict.title}-${conflict.start}-${conflict.end}`}>
          <p>{conflict.title}</p>
          <p className="meta">{conflict.start}</p>
          <p className="meta">{conflict.end}</p>
        </div>
      ))}
      {body.continuesAfterWindow === true ? (
        <p className="continuation">The repetition continues after 90 days.</p>
      ) : null}
    </div>
  );
}
