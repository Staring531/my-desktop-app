import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '../components/auth-forms';
import { CalendarForm } from '../components/calendar-form';
import { EventForm } from '../components/event-form';
import { CalendarPage } from '../components/signed';
import type { ApiBody } from '../lib/api';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('website forms', () => {
  it('shows a stubbed monthly preview as returned', async () => {
    const user = userEvent.setup();
    const seen: unknown[] = [];
    stub((url, init) => {
      seen.push(sent(url, init));
      return {
        result: 'save_rejected',
        monthTypes: ['February'],
        missingDates: ['2026-02-31'],
      };
    });
    render(<EventForm draft={blank} />);
    await fillEvent(user);
    await user.click(screen.getByRole('radio', { name: 'monthly' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('save_rejected')).toBeTruthy();
    expect(screen.getByText('February')).toBeTruthy();
    expect(screen.getByText('2026-02-31')).toBeTruthy();
    expect(seen[0]).toMatchObject({
      path: '/api/events',
      body: { repetition: 'monthly', title: 'Focus' },
    });
  });

  it('shows an empty conflict list and the continuation sentence from the body', async () => {
    const user = userEvent.setup();
    stub(() => ({ result: 'ok', conflicts: [], continuesAfterWindow: true }));
    render(<EventForm draft={blank} />);
    await fillEvent(user);
    await user.click(screen.getByRole('radio', { name: 'daily' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('ok')).toBeTruthy();
    expect(screen.getByText('The repetition continues after 90 days.')).toBeTruthy();
    expect(screen.queryByText('Standup')).toBeNull();
  });

  it('shows each returned conflict title, start, and end', async () => {
    const user = userEvent.setup();
    stub(() => ({
      result: 'ok',
      conflicts: [
        {
          title: 'Standup',
          start: '2026-06-02T13:00:00.000Z',
          end: '2026-06-02T14:00:00.000Z',
        },
      ],
    }));
    render(<EventForm draft={blank} />);
    await fillEvent(user);
    await user.click(screen.getByRole('radio', { name: 'non-repeating' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Standup')).toBeTruthy();
    expect(screen.getByText('2026-06-02T13:00:00.000Z')).toBeTruthy();
    expect(screen.getByText('2026-06-02T14:00:00.000Z')).toBeTruthy();
  });

  it('shows skipped and choice rows from the body and submits one listed instant', async () => {
    const user = userEvent.setup();
    const calls: Array<{ path: string; body: unknown }> = [];
    const earlier = '2026-11-01T05:30:00.000Z';
    const later = '2026-11-01T06:30:00.000Z';
    stub((url, init) => {
      const request = sent(url, init);
      calls.push(request);
      if (request.path.includes('/choices')) {
        return { result: 'ok' };
      }
      return {
        result: 'ok',
        occurrences: [
          {
            id: 'series-1',
            state: 'skipped',
            visibility: 'private',
            title: 'Spring',
            location: '',
            description: '',
            displayName: 'Ada',
            date: '2026-03-08',
          },
          {
            id: 'series-1',
            state: 'choice_required',
            visibility: 'public',
            title: 'Fall',
            location: 'Hall',
            description: 'Notes',
            displayName: 'Ada',
            date: '2026-11-01',
            instants: [earlier, later],
          },
        ],
      };
    });
    render(<CalendarForm />);
    await user.type(screen.getByLabelText('From'), '2026-03-01');
    await user.type(screen.getByLabelText('To'), '2026-11-01');
    await user.click(screen.getByRole('button', { name: 'Show range' }));
    expect(await screen.findByText('skipped')).toBeTruthy();
    expect(screen.getByText('choice_required')).toBeTruthy();
    expect(screen.getAllByText('Ada')).toHaveLength(2);
    expect(screen.queryByText('cancelled')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Submit choice' }));
    expect(calls.some((call) => call.path.includes('/choices'))).toBe(false);
    await user.click(screen.getByRole('radio', { name: earlier }));
    await user.click(screen.getByRole('button', { name: 'Submit choice' }));
    await waitFor(() => {
      expect(calls.some((call) => call.path === '/api/events/series-1/choices')).toBe(true);
    });
    const choice = calls.find((call) => call.path === '/api/events/series-1/choices');
    expect(choice?.body).toEqual({ date: '2026-11-01', instant: earlier });
    expect(screen.getByText('ok')).toBeTruthy();
  });

  it('shows logged_out without calendar or event fields', async () => {
    stub(() => ({ result: 'logged_out' }));
    render(<CalendarPage onOk={() => undefined} />);
    expect(await screen.findByText('logged_out')).toBeTruthy();
    expect(screen.queryByLabelText('From')).toBeNull();
    expect(screen.queryByLabelText('Title')).toBeNull();
  });

  it('hides the event fields when another account returns not_found', async () => {
    const user = userEvent.setup();
    stub(() => ({ result: 'not_found' }));
    render(
      <EventForm
        draft={{
          id: 'event-1',
          title: 'Focus',
          location: '',
          description: '',
          visibility: 'private',
          start: '',
          end: '',
        }}
      />,
    );
    await user.type(screen.getByLabelText('Start date'), '2026-06-02');
    await user.type(screen.getByLabelText('Start time'), '09:00');
    await user.type(screen.getByLabelText('End date'), '2026-06-02');
    await user.type(screen.getByLabelText('End time'), '10:00');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('not_found')).toBeTruthy();
    expect(screen.queryByLabelText('Title')).toBeNull();
  });

  it('sends the browser timezone from registration and has no timezone field', async () => {
    const user = userEvent.setup();
    const calls: unknown[] = [];
    stub((url, init) => {
      calls.push(sent(url, init).body);
      return { result: 'ok' };
    });
    render(<RegisterForm timeZone="America/New_York" />);
    expect(screen.queryByLabelText('Timezone')).toBeNull();
    await user.type(screen.getByLabelText('Username'), 'ada');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret-phrase');
    await user.click(screen.getByRole('button', { name: 'Register' }));
    await screen.findByText('ok');
    expect(calls[0]).toEqual({
      username: 'ada',
      email: 'ada@example.com',
      password: 'secret-phrase',
      nickname: '',
      timezone: 'America/New_York',
    });
  });

  it('does not offer search, sharing, a team, or another calendar', () => {
    const source = sources(join(process.cwd(), 'app')) + sources(join(process.cwd(), 'components'));
    expect(source).not.toContain('design-tokens.json');
    expect(source).not.toMatch(/\/search\b|sharing|other calendar|other-calendar|\bteam\b/i);
  });
});

const blank = {
  title: '',
  location: '',
  description: '',
  visibility: 'private' as const,
  start: '',
  end: '',
};

function stub(reply: (url: string, init: RequestInit | undefined) => ApiBody) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) =>
      Promise.resolve({ json: () => Promise.resolve(reply(String(url), init)) }),
    ),
  );
}

function sent(url: string, init: RequestInit | undefined) {
  return {
    path: url,
    body: init?.body === undefined ? undefined : (JSON.parse(String(init.body)) as unknown),
  };
}

async function fillEvent(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Title'), 'Focus');
  await user.type(screen.getByLabelText('Start date'), '2026-06-02');
  await user.type(screen.getByLabelText('Start time'), '09:00');
  await user.type(screen.getByLabelText('End date'), '2026-06-02');
  await user.type(screen.getByLabelText('End time'), '10:00');
}

function sources(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .map((entry) => {
      const path = join(directory, entry.name);
      if (entry.name.includes('.test.')) {
        return '';
      }
      return entry.isDirectory() ? sources(path) : readFileSync(path, 'utf8');
    })
    .join('\n');
}
