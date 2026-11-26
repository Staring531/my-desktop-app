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

type PageProps = {
  title: string;
  subtitle?: string;
  links?: ReactNode;
  children: ReactNode;
  variant?: 'workspace' | 'auth';
};

export function Page({
  title,
  subtitle,
  links,
  children,
  variant = 'workspace',
}: PageProps) {
  if (variant === 'auth') {
    return (
      <div className="auth-shell">
        <aside className="auth-aside" aria-label="Personal Time">
          <a className="brand-lockup" href="/login">
            <span className="brand-mark" aria-hidden="true">
              PT
            </span>
            <span className="brand-copy">
              <strong>Personal Time</strong>
              <small>MAKE TIME YOURS</small>
            </span>
          </a>
          <div className="auth-message">
            <p className="eyebrow">PERSONAL TIME MANAGEMENT</p>
            <h2>Make room for what matters.</h2>
            <p>
              Bring your plans into focus. Keep your time organized, your priorities clear,
              and your calendar yours.
            </p>
            <div className="auth-art" aria-hidden="true">
              <div className="auth-art-card">
                <div className="auth-art-top">
                  <span>Your time</span>
                  <span className="auth-art-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
                <div className="auth-art-line" />
                <div className="auth-art-line" />
              </div>
            </div>
          </div>
          <p className="auth-aside-foot">A more intentional way to plan your day.</p>
        </aside>
        <main className="auth-main" aria-labelledby="page-title">
          <div className="auth-card">
            <p className="auth-welcome">PERSONAL TIME MANAGEMENT</p>
            <header className="auth-heading">
              <h1 id="page-title">{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </header>
            <div className="auth-body">{children}</div>
            {links ? <div className="auth-links-wrap">{links}</div> : null}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <a className="brand-lockup" href="/calendar">
          <span className="brand-mark" aria-hidden="true">
            PT
          </span>
          <span className="brand-copy">
            <strong>Personal Time</strong>
            <small>YOUR PERSONAL SPACE</small>
          </span>
        </a>
        <p className="nav-kicker">Workspace</p>
        {links}
        <div className="sidebar-footer">
          <span className="sidebar-footer-mark" aria-hidden="true" />
          <div className="sidebar-footer-copy">
            <strong>One calendar. Your time.</strong>
            <span>A personal space for the things that matter.</span>
          </div>
        </div>
      </aside>
      <main className="main-area" aria-labelledby="page-title">
        <header className="page-header">
          <div className="page-heading-copy">
            <p className="eyebrow">PERSONAL TIME MANAGEMENT</p>
            <h1 id="page-title">{title}</h1>
            {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export function UnsignedLinks({ active }: { active?: string }) {
  return (
    <>
      <p className="auth-links-label">Account options</p>
      <nav className="auth-links" aria-label="Account navigation">
        {UNSIGNED.map(([href, label]) => (
          <a
            className={href === active ? 'auth-link is-active' : 'auth-link'}
            href={href}
            key={href}
            aria-current={href === active ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}

function NavigationIcon({ name }: { name: 'calendar' | 'new' | 'account' }) {
  return (
    <span className="nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {name === 'calendar' ? (
          <>
            <rect x="3.5" y="5" width="17" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3.5 10h17" />
          </>
        ) : null}
        {name === 'new' ? <path d="M12 5v14M5 12h14" /> : null}
        {name === 'account' ? (
          <>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: 'calendar' | 'new' | 'account';
  active?: boolean;
}) {
  return (
    <a
      className={active ? 'nav-link is-active' : 'nav-link'}
      href={href}
      aria-current={active ? 'page' : undefined}
    >
      <NavigationIcon name={icon} />
      <span>{label}</span>
    </a>
  );
}

export function CalendarLinks() {
  return (
    <nav className="primary-nav" aria-label="Calendar navigation">
      <NavItem href="/calendar" label="Calendar" icon="calendar" active />
      <NavItem href="/events/new" label="New event" icon="new" />
      <NavItem href="/account" label="Account" icon="account" />
    </nav>
  );
}

export function EventLinks({ active }: { active?: boolean }) {
  return (
    <nav className="primary-nav" aria-label="Event navigation">
      <NavItem href="/calendar" label="Calendar" icon="calendar" />
      <NavItem href="/events/new" label="New event" icon="new" active={active} />
      <NavItem href="/account" label="Account" icon="account" />
    </nav>
  );
}

export function AccountLinks() {
  return (
    <nav className="primary-nav" aria-label="Account navigation">
      <NavItem href="/calendar" label="Calendar" icon="calendar" />
      <NavItem href="/events/new" label="New event" icon="new" />
      <NavItem href="/account" label="Account" icon="account" active />
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
    <label className="field">
      <span>{label}</span>
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
  className,
}: {
  variant: 'primary' | 'quiet';
  children: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      className={className ? `${variant} ${className}` : variant}
      type={type}
      onClick={onClick}
    >
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
  return (
    <div
      className={body.result === 'ok' ? 'result result--ok' : 'result'}
      role="alert"
      aria-live="assertive"
    >
      <div className="result-header">
        <span className="result-mark" aria-hidden="true">
          {body.result === 'ok' ? '✓' : '!'}
        </span>
        <p>{body.result}</p>
      </div>
      {body.monthTypes || body.missingDates || body.conflicts || body.continuesAfterWindow ? (
        <div className="result-body">
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
      ) : null}
    </div>
  );
}
