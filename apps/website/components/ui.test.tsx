import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CommandButton, Page, Result, SignedLinks, TextField, UnsignedLinks } from './ui';

afterEach(cleanup);

describe('website UI primitives', () => {
  it('provides a labelled main landmark and one page-level heading', () => {
    render(
      <Page title="Calendar">
        <p>Calendar content</p>
      </Page>,
    );

    expect(screen.getByRole('main', { name: 'Calendar' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Calendar' })).toBeTruthy();
  });

  it('labels signed and unsigned navigation landmarks', () => {
    const { rerender } = render(<UnsignedLinks />);
    expect(screen.getByRole('navigation', { name: 'Account navigation' })).toBeTruthy();

    rerender(<SignedLinks />);
    expect(screen.getByRole('navigation', { name: 'Workspace navigation' })).toBeTruthy();
  });

  it('associates a visible field label with its input', () => {
    render(<TextField label="Email" value="" onChange={() => undefined} type="email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeTruthy();
  });

  it('exposes pending and successful results as polite status messages', () => {
    const { rerender } = render(<Result phase="waiting" />);
    expect(screen.getByRole('status').textContent).toBe('waiting');

    rerender(<Result phase="done" body={{ result: 'ok' }} />);
    expect(screen.getByRole('status').textContent).toContain('ok');
  });

  it('exposes rejected results as alerts', () => {
    render(<Result phase="done" body={{ result: 'save_rejected' }} />);
    expect(screen.getByRole('alert').textContent).toContain('not_allowed');
  });

  it('supports native disabled state for command buttons', () => {
    render(
      <CommandButton variant="primary" disabled>
        Save
      </CommandButton>,
    );
    expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
  });
});
