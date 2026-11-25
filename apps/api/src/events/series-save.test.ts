import 'reflect-metadata';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
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
const now = new Date('2026-06-10T14:30:00.000Z');

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

describe('series time save', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-series-save-'));
  const port = 54342;
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
    app = await NestFactory.create(createApplication({ pool, mail, now: () => now }), {
      logger: false,
    });
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    if (address === null || typeof address === 'string') {
      throw new Error('series save test server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
    const code = await register(baseUrl, mail);
    expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
      status: 200,
      body: { result: 'ok' },
    });
    cookie = await login(baseUrl);
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await postgres.stop();
  });

  it('keeps started instants and moves the occurrence that has not started', async () => {
    const created = await save(baseUrl, cookie, {
      title: 'Weekly',
      repetition: 'weekly',
      visibility: 'public',
      location: 'Desk',
      description: 'Old',
      start: { date: '2026-06-03', time: '09:00' },
      end: { date: '2026-06-03', time: '11:00' },
    });
    expect(created.status).toBe(200);
    const seriesId = await idByTitle(pool, 'Weekly');
    const detachedId = randomUUID();
    await pool.query(
      `INSERT INTO events (
         id, calendar_id, creator_account_id, repetition, title, location, description, visibility,
         start_instant, end_instant, detached_from_event_id, original_start_instant
       )
       SELECT $1, calendar_id, creator_account_id, 'none', 'Solo', 'Hall', 'Kept', 'public',
              '2026-06-03T13:00:00.000Z', '2026-06-03T15:00:00.000Z', id, '2026-05-27T13:00:00.000Z'
       FROM events WHERE id = $2`,
      [detachedId, seriesId],
    );
    await pool.query(
      `INSERT INTO series_absences (series_event_id, original_start_instant, civil_date)
       VALUES ($1, '2026-05-27T13:00:00.000Z', '2026-05-27')`,
      [seriesId],
    );
    const saved = await save(
      baseUrl,
      cookie,
      {
        title: 'Renamed',
        visibility: 'private',
        location: 'Room',
        description: 'Notes',
        start: { date: '2026-06-18', time: '15:00' },
        end: { date: '2026-06-18', time: '16:00' },
      },
      seriesId,
    );
    expect(saved.status).toBe(200);
    const readBody = await read(baseUrl, cookie, '2026-06-03', '2026-06-18');
    expect(named(readBody.occurrences, 'Renamed')).toEqual([
      occurrence('2026-06-03', '2026-06-03T13:00:00.000Z', '2026-06-03T15:00:00.000Z'),
      occurrence('2026-06-10', '2026-06-10T13:00:00.000Z', '2026-06-10T15:00:00.000Z'),
      occurrence('2026-06-18', '2026-06-18T19:00:00.000Z', '2026-06-18T20:00:00.000Z'),
    ]);
    expect(readBody.occurrences?.some((row) => row.date === '2026-06-17')).toBe(false);
    const freezes = await pool.query<{ start_instant: Date; end_instant: Date }>(
      `SELECT start_instant, end_instant FROM series_freezes WHERE series_event_id = $1
       ORDER BY start_instant`,
      [seriesId],
    );
    expect(freezes.rows.map((row) => row.start_instant.toISOString())).toEqual([
      '2026-06-03T13:00:00.000Z',
      '2026-06-10T13:00:00.000Z',
    ]);
    expect(freezes.rows.map((row) => row.end_instant.toISOString())).toEqual([
      '2026-06-03T15:00:00.000Z',
      '2026-06-10T15:00:00.000Z',
    ]);
    const detached = await pool.query(
      `SELECT title, location, description, visibility, start_instant, end_instant
       FROM events WHERE id = $1`,
      [detachedId],
    );
    expect(detached.rows[0]).toMatchObject({
      title: 'Solo',
      location: 'Hall',
      description: 'Kept',
      visibility: 'public',
    });
    expect(detached.rows[0]?.start_instant.toISOString()).toBe('2026-06-03T13:00:00.000Z');
    const absences = await pool.query(
      'SELECT civil_date::text FROM series_absences WHERE series_event_id = $1',
      [seriesId],
    );
    expect(absences.rows).toEqual([{ civil_date: '2026-05-27' }]);
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

function occurrence(date: string, start: string, end: string) {
  return {
    id: expect.any(String) as unknown as string,
    state: 'scheduled',
    visibility: 'private',
    title: 'Renamed',
    location: 'Room',
    description: 'Notes',
    displayName: 'owner',
    date,
    start,
    end,
    originalStart: start,
  };
}

function named(
  occurrences: Array<{ title?: string; date?: string }> | undefined,
  title: string,
): Array<{ title?: string; date?: string }> {
  return occurrences?.filter((row) => row.title === title) ?? [];
}

async function register(baseUrl: string, mail: RecordingMail) {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/registrations', {
    username: 'owner',
    email: 'owner@example.com',
    password: 'secret-phrase',
    timezone: 'America/New_York',
  });
  expect(response).toEqual({ status: 200, body: { result: 'ok' } });
  return mail.messages[before]?.code ?? '';
}

async function login(baseUrl: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'owner@example.com', password: 'secret-phrase' }),
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

async function save(baseUrl: string, cookie: string, body: unknown, id?: string) {
  const response = await fetch(
    `${baseUrl}${id === undefined ? '/api/events' : `/api/events/${id}`}`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    },
  );
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function read(baseUrl: string, cookie: string, from: string, to: string) {
  const response = await fetch(`${baseUrl}/api/calendar?from=${from}&to=${to}`, {
    headers: { cookie },
  });
  return (await response.json()) as {
    occurrences?: Array<{ title?: string; date?: string }>;
  };
}

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}
