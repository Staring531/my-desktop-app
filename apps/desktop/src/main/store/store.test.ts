import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createFileStore, TEAM_FILE, TEAM_TEMP, toDocument } from './index.js';
import type { ActiveRecord } from '../../domain/types.js';

function directory(): string {
  return mkdtempSync(join(tmpdir(), 'team-record-'));
}

function active(): ActiveRecord {
  return {
    status: 'active',
    generation: 'g1',
    maintainerEmail: 'sam@team.com',
    roster: [{ email: 'sam@team.com' }],
    invites: [],
    events: [
      {
        id: 'e1',
        ownerEmail: 'sam@team.com',
        visibility: 'team-visible',
        title: 'HQ',
        location: '',
        description: 'line one\nline two',
        start: '2026-11-19T14:00:00.000Z',
        end: '2026-11-19T15:00:00.000Z',
      },
    ],
  };
}

describe('team store', () => {
  it('treats a missing file as absent and round-trips active and dissolved documents', () => {
    const dir = directory();
    const store = createFileStore(dir);
    expect(store.load()).toEqual({ kind: 'absent' });
    expect(store.replace(active()).ok).toBe(true);
    expect(store.load()).toEqual({ kind: 'record', record: active() });
    expect(store.replace({ status: 'dissolved', generation: 'g1' }).ok).toBe(true);
    expect(store.load()).toEqual({
      kind: 'record',
      record: { status: 'dissolved', generation: 'g1' },
    });
  });

  it('keeps the original bytes when a step fails and ignores a leftover temp file', () => {
    const dir = directory();
    const store = createFileStore(dir);
    expect(store.replace(active()).ok).toBe(true);
    const original = readFileSync(join(dir, TEAM_FILE), 'utf8');
    writeFileSync(
      join(dir, TEAM_TEMP),
      JSON.stringify(toDocument({ status: 'dissolved', generation: 'other' })),
    );
    expect(store.load()).toEqual({ kind: 'record', record: active() });

    const failing = createFileStore(dir, {
      rename() {
        throw new Error('fail');
      },
    });
    expect(failing.replace({ status: 'dissolved', generation: 'g1' })).toEqual({
      ok: false,
      reason: 'replace-failed',
    });
    expect(readFileSync(join(dir, TEAM_FILE), 'utf8')).toBe(original);

    const serial = createFileStore(dir, {
      stringify() {
        throw new Error('json');
      },
    });
    expect(serial.replace(active())).toEqual({ ok: false, reason: 'serialize' });
    expect(readFileSync(join(dir, TEAM_FILE), 'utf8')).toBe(original);
  });

  it('does not overwrite an unreadable file', () => {
    const dir = directory();
    const file = join(dir, TEAM_FILE);
    writeFileSync(file, '{');
    const store = createFileStore(dir);
    expect(store.load().kind).toBe('unreadable');
    expect(store.replace(active())).toEqual({ ok: false, reason: 'unreadable' });
    expect(readFileSync(file, 'utf8')).toBe('{');

    writeFileSync(file, JSON.stringify({ formatVersion: 2, status: 'active' }));
    expect(store.load().kind).toBe('unreadable');
    expect(readFileSync(file, 'utf8')).toContain('"formatVersion":2');

    writeFileSync(
      file,
      JSON.stringify({
        formatVersion: 1,
        status: 'active',
        generation: 'g1',
        maintainerEmail: 'sam@team.com',
        roster: [{ email: 'sam@team.com' }, { email: 'sam@team.com' }],
        invites: [],
        events: [],
      }),
    );
    expect(store.load().kind).toBe('unreadable');
    expect(store.replace({ status: 'dissolved', generation: 'g1' }).ok).toBe(false);
  });
});
