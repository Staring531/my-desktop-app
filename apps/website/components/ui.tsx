import type { ReactNode } from 'react';
import type { ApiBody } from '../lib/api';

const UNSIGNED = [
  ['/register', 'Register'],
  ['/verify', 'Verify'],
  ['/register/cancel', 'Cancel registration'],
  ['/login', 'Log in'],
  ['/recovery', 'Start recovery'],
  ['/recovery/complete', 'Complete recovery'],
] as const;

export function Page({
  title,
  links,
  children,
}: {
  title: string;
  links?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="column">
      <header className="top">
        <h1>{title}</h1>
        {links}
      </header>
      {children}
    </main>
  );
}

export function UnsignedLinks() {
  return (
    <nav className="links">
      {UNSIGNED.map(([href, label]) => (
        <a className="quiet-link" href={href} key={href}>
          {label}
        </a>
      ))}
    </nav>
  );
}

export function CalendarLinks() {
  return (
    <nav className="links">
      <a className="quiet-link" href="/events/new">
        New event
      </a>
      <a className="quiet-link" href="/account">
        Account
      </a>
    </nav>
  );
}

export function EventLinks() {
  return (
    <nav className="links">
      <a className="quiet-link" href="/calendar">
        Calendar
      </a>
      <a className="quiet-link" href="/account">
        Account
      </a>
    </nav>
  );
}

export function AccountLinks() {
  return (
    <nav className="links">
      <a className="quiet-link" href="/calendar">
        Calendar
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
  multiline?: boolean;
}) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

export function CommandButton({
  variant,
  children,
  type = 'button',
  onClick,
}: {
  variant: 'primary' | 'quiet';
  children: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
}) {
  return (
    <button className={variant} type={type} onClick={onClick}>
      {children}
    </button>
  );
}

export function Result({ phase, body }: { phase: 'idle' | 'waiting' | 'done'; body?: ApiBody }) {
  if (phase === 'waiting') {
    return <p className="waiting">waiting</p>;
  }
  if (phase !== 'done' || body === undefined) {
    return null;
  }
  return (
    <div className="result" role="alert">
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
