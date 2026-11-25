import 'reflect-metadata';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { Pool } from 'pg';
import { createApplication } from '../app.module';
import { applyMigrations, createPersonalTimePool, migrationsDirectory } from '../db/connection';
import type { MailPort, ProofMessage } from '../mail/protocol';

const require = createRequire(__filename);

type EmbeddedPostgresServer = {
  initialise(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  createDatabase(name: string): Promise<void>;
};

type EmbeddedPostgresConstructor = new (options: {
  databaseDir: string;
  user: string;
  password: string;
  port: number;
  persistent: boolean;
}) => EmbeddedPostgresServer;

const embeddedPostgresModule = require('embedded-postgres') as
  EmbeddedPostgresConstructor | { default: EmbeddedPostgresConstructor };

const EmbeddedPostgres =
  'default' in embeddedPostgresModule ? embeddedPostgresModule.default : embeddedPostgresModule;

type Conflict = { title: string; start: string; end: string };

describe('event conflict warnings', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-conflicts-'));
  const port = 54339;
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false,
  });
  const mail = new RecordingMail();
  let pool: Pool;
  let app: INestApplication;
  let baseUrl = '';
  let cookie = '';

  beforeAll(async () => {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase('personal_time');
    pool = createPersonalTimePool(`postgresql://postgres:postgres@127.0.0.1:${port}/personal_time`);
    const client = await pool.connect();
    try {
      await applyMigrations(client, migrationsDirectory());
    } finally {
      client.release();
    }
    app = await NestFactory.create(createApplication({ pool, mail }), { logger: false });
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    if (address === null || typeof address === 'string') {
      throw new Error('conflict test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    const code = await register(baseUrl, mail, 'owner', 'owner@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    cookie = await login(baseUrl, 'owner@example.com');
    expect(
      (
        await save(
          baseUrl,
          cookie,
          eventBody('Yesterday', '22:00', '11:00', '2026-01-01', '2026-01-02'),
        )
      ).body.result,
    ).toBe('ok');
    expect(
      (await save(baseUrl, cookie, eventBody('In progress', '08:00', '12:00', '2026-01-02'))).body
        .result,
    ).toBe('ok');
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('lists another owned overlap and still saves', async () => {
    const saved = await save(baseUrl, cookie, eventBody('Meeting', '09:00', '10:00', '2026-01-02'));
    expect(saved.status).toBe(200);
    expect(saved.body.result).toBe('ok');
    expect(saved.body.conflicts).toEqual([
      {
        title: 'Yesterday',
        start: '2026-01-02T03:00:00.000Z',
        end: '2026-01-02T16:00:00.000Z',
      },
      {
        title: 'In progress',
        start: '2026-01-02T13:00:00.000Z',
        end: '2026-01-02T17:00:00.000Z',
      },
    ]);
    const text = JSON.stringify(saved.body);
    expect(text).not.toContain('owner@example.com');
    expect(text).not.toContain('@');
    for (const conflict of saved.body.conflicts ?? []) {
      expect(Object.keys(conflict).sort()).toEqual(['end', 'start', 'title']);
    }
    expect(await titles(pool)).toContain('Meeting');
  });

  it('does not list the event when only its title changes', async () => {
    const meetingId = await idByTitle(pool, 'Meeting');
    const edited = await save(
      baseUrl,
      cookie,
      { ...eventBody('Renamed', '09:00', '10:00', '2026-01-02'), location: '', description: '' },
      meetingId,
    );
    expect(edited.body.conflicts?.map((conflict) => conflict.title)).toEqual([
      'Yesterday',
      'In progress',
    ]);
    expect(edited.body.conflicts?.map((conflict) => conflict.title)).not.toContain('Renamed');
  });

  it('does not list an event that ends when the saved event starts', async () => {
    expect(
      (await save(baseUrl, cookie, eventBody('Left', '09:00', '10:00', '2026-05-01'))).body
        .conflicts,
    ).toEqual([]);
    const right = await save(baseUrl, cookie, eventBody('Right', '10:00', '11:00', '2026-05-01'));
    expect(right.status).toBe(200);
    expect(right.body.conflicts).toEqual([]);
  });

  it('lists no event when nothing overlaps inside the window', async () => {
    const alone = await save(baseUrl, cookie, eventBody('Alone', '09:00', '10:00', '2026-02-15'));
    expect(alone).toEqual({ status: 200, body: { result: 'ok', conflicts: [] } });
  });

  it('lists a partial overlap at the far boundary and omits an overlap entirely after it', async () => {
    const code = await register(baseUrl, mail, 'edge', 'edge@example.com');
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    const edge = await login(baseUrl, 'edge@example.com');
    expect(
      (
        await save(
          baseUrl,
          edge,
          eventBody('Boundary', '22:00', '06:00', '2026-03-31', '2026-04-01'),
        )
      ).body.result,
    ).toBe('ok');
    expect(
      (await save(baseUrl, edge, eventBody('After', '01:00', '03:00', '2026-04-01'))).body.result,
    ).toBe('ok');
    const span = await save(
      baseUrl,
      edge,
      eventBody('Span', '00:00', '12:00', '2026-01-01', '2026-04-02'),
    );
    expect(span.status).toBe(200);
    expect(span.body.conflicts).toEqual([
      {
        title: 'Boundary',
        start: '2026-04-01T02:00:00.000Z',
        end: '2026-04-01T10:00:00.000Z',
      },
    ]);
    expect(await titles(pool)).toContain('Span');
    expect(await titles(pool)).toContain('After');
  });
});

class RecordingMail implements MailPort {
  messages: ProofMessage[] = [];

  canSend(): Promise<boolean> {
    return Promise.resolve(true);
  }

  sendProof(message: ProofMessage): Promise<'accepted'> {
    this.messages.push(message);
    return Promise.resolve('accepted');
  }
}

function eventBody(
  title: string,
  start: string,
  end: string,
  startDate: string,
  endDate = startDate,
) {
  return {
    title,
    repetition: 'none' as const,
    start: { date: startDate, time: start },
    end: { date: endDate, time: end },
  };
}

async function register(baseUrl: string, mail: RecordingMail, username: string, email: string) {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/registrations', {
    username,
    email,
    password: 'secret-phrase',
    timezone: 'America/New_York',
  });
  expect(response).toEqual({ status: 200, body: { result: 'ok' } });
  return mail.messages[before]?.code ?? '';
}

async function login(baseUrl: string, email: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret-phrase' }),
  });
  expect(response.status).toBe(200);
  return response.headers.getSetCookie()[0]?.split(';')[0] ?? '';
}

async function post(baseUrl: string, path: string, body: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function save(
  baseUrl: string,
  cookie: string,
  body: unknown,
  id?: string,
): Promise<{ status: number; body: { result: string; conflicts?: Conflict[] } }> {
  const response = await fetch(
    `${baseUrl}${id === undefined ? '/api/events' : `/api/events/${id}`}`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    },
  );
  return {
    status: response.status,
    body: (await response.json()) as { result: string; conflicts?: Conflict[] },
  };
}

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}

async function titles(pool: Pool): Promise<string[]> {
  const result = await pool.query<{ title: string }>('SELECT title FROM events ORDER BY title');
  return result.rows.map((row) => row.title);
}
