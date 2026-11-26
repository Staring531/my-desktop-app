import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  AccountLinks,
  CalendarLinks,
  EventLinks,
  Page,
  Result,
  TextField,
  UnsignedLinks,
} from './ui';

afterEach(cleanup);

describe('shared website UI', () => {
  it('exposes one labelled main landmark and page heading', () => {
    render(
      <Page title="Own Calendar">
        <p>Calendar content</p>
      </Page>,
    );

    expect(screen.getByRole('main', { name: 'Own Calendar' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Own Calendar' })).toBeTruthy();
  });

  it('gives unsigned and signed navigation distinct accessible names', () => {
    const { rerender } = render(<UnsignedLinks />);
    expect(screen.getByRole('navigation', { name: 'Account navigation' })).toBeTruthy();

    rerender(<CalendarLinks />);
    expect(screen.getByRole('navigation', { name: 'Calendar navigation' })).toBeTruthy();

    rerender(<EventLinks />);
    expect(screen.getByRole('navigation', { name: 'Event navigation' })).toBeTruthy();

    rerender(<AccountLinks />);
    expect(screen.getByRole('navigation', { name: 'Account navigation' })).toBeTruthy();
  });

  it('renders signed-in pages in the workspace shell', () => {
    render(
      <Page title="My calendar" links={<CalendarLinks />}>
        <p>Calendar content</p>
      </Page>,
    );

    expect(screen.getByRole('main', { name: 'My calendar' }).parentElement?.className).toBe(
      'workspace-shell',
    );
    expect(screen.getByRole('navigation', { name: 'Calendar navigation' })).toBeTruthy();
  });

  it('renders account entry pages in the split authentication shell', () => {
    render(
      <Page
        variant="auth"
        title="Create your account"
        links={<UnsignedLinks active="/register" />}
      >
        <p>Registration form</p>
      </Page>,
    );

    const main = screen.getByRole('main', { name: 'Create your account' });
    expect(main.closest('.auth-shell')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Make room for what matters.' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Register' }).getAttribute('aria-current')).toBe('page');
  });

  it('associates a visible field label with its control', () => {
    render(<TextField label="Email" value="" onChange={() => undefined} />);

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeTruthy();
  });

  it('announces pending feedback as a polite status', () => {
    render(<Result phase="waiting" />);

    expect(screen.getByRole('status').textContent).toBe('waiting');
  });

  it('announces command results through the shared alert region', () => {
    render(<Result phase="done" body={{ result: 'ok' }} />);

    expect(screen.getByRole('alert').textContent).toContain('ok');
  });
});
