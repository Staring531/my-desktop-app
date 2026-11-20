import { describe, expect, it } from 'vitest';
import { createDesktopBridge } from './bridge.js';

describe('preload API', () => {
  it('exposes bind, session, command, and this window only', async () => {
    const calls: unknown[] = [];
    const bridge = createDesktopBridge({
      invoke: (channel, payload) => {
        calls.push({ channel, payload });
        return Promise.resolve({ ok: true });
      },
      subscribe: (channel) => {
        calls.push({ channel });
        return () => undefined;
      },
    });
    expect(Object.keys(bridge).sort()).toEqual([
      'bind',
      'command',
      'onProjection',
      'onWriter',
      'openSession',
      'platform',
    ]);
    expect(JSON.stringify(bridge)).not.toContain('team-record.json');
    await bridge.openSession();
    await bridge.bind('Sam@Team.com');
    await bridge.command({ name: 'createTeam' });
    expect(calls[0]).toEqual({ channel: 'desktop:open-session', payload: undefined });
    expect(calls[1]).toEqual({
      channel: 'desktop:bind',
      payload: { requestedEmail: 'Sam@Team.com' },
    });
    expect(calls[2]).toEqual({ channel: 'desktop:command', payload: { name: 'createTeam' } });
    const command = {
      name: 'createEvent' as const,
      visibility: 'team-visible' as const,
      title: 'HQ',
      start: { year: 2026, month: 1, day: 2, hour: 9, minute: 0 },
      end: { year: 2026, month: 1, day: 2, hour: 10, minute: 0 },
    };
    expect(command).not.toHaveProperty('actorEmail');
    expect(command).not.toHaveProperty('zone');
    expect(command).not.toHaveProperty('generation');
    expect(command).not.toHaveProperty('eventId');
  });
});
