import 'reflect-metadata';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { changeOwnedTimezone, deleteOwnedAccount } from '../account/account.service';
import { createApplication } from '../app.module';
import { applyMigrations, createPersonalTimePool, migrationsDirectory } from '../db/connection';
import { deleteOwnedOccurrence, detachOwnedEvent, saveOwnedEvent } from '../events/event.service';
import type { MailPort, ProofMessage } from '../mail/protocol';
import { cancelRegistration } from '../registration/cancellation.service';
import { verifyProof } from '../registration/verification.service';
import { completeRecovery, startRecovery } from '../recovery/recovery.service';

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

async function startRaceDatabase(): Promise<{
  connectionString: string;
  stop: () => Promise<void>;
}> {
  const configured = process.env.DATABASE_URL;
  if (configured !== undefined && configured !== '') {
    return { connectionString: configured, stop: async () => {} };
  }
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-races-'));
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: 54348,
    persistent: false,
  });
  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase('personal_time');
  return {
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54348/personal_time',
    stop: () => postgres.stop(),
  };
}

describe('PostgreSQL race suite', () => {
  const mail = new RecordingMail();
  let pool: Pool;
  let app: INestApplication;
  let baseUrl = '';
  let stopDatabase: () => Promise<void> = async () => {};

  beforeAll(async () => {
    const database = await startRaceDatabase();
    stopDatabase = database.stop;
    pool = createPersonalTimePool(database.connectionString);
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
      throw new Error('race suite server has no port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await stopDatabase();
  });

  it('stores the last committed save and leaves a rolled-back save unwritten', async () => {
    const cookie = await verifiedSession(baseUrl, mail, 'saver', 'saver@example.com');
    expect(
      (await save(baseUrl, cookie, none('Focus', '2026-06-02', '09:00', '10:00'))).status,
    ).toBe(200);
    const focusId = await idByTitle(pool, 'Focus');
    const raced = await overlap(pool, {
      leader: (client, release, ready) =>
        saveOwnedEvent(
          client,
          cookie,
          focusId,
          none('First save', '2026-06-02', '09:00', '10:00'),
          {
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) =>
        saveOwnedEvent(client, cookie, focusId, {
          ...none('Last save', '2026-06-02', '13:00', '14:00'),
          location: 'Hall',
          description: 'Final',
          visibility: 'public',
        }),
    });
    expect(raced.leader.body.result).toBe('ok');
    expect(raced.follower.body.result).toBe('ok');
    expect(await eventRow(pool, focusId)).toMatchObject({
      title: 'Last save',
      location: 'Hall',
      description: 'Final',
      visibility: 'public',
      start: '2026-06-02T17:00:00.000Z',
      end: '2026-06-02T18:00:00.000Z',
    });
    const client = await pool.connect();
    try {
      const rolled = await saveOwnedEvent(
        client,
        cookie,
        focusId,
        none('Rolled', '2026-06-02', '15:00', '16:00'),
        { beforeCommit: () => Promise.reject(new Error('stop')) },
      );
      expect(rolled.body.result).toBe('operation_failed');
    } finally {
      client.release();
    }
    expect((await eventRow(pool, focusId)).title).toBe('Last save');
  });

  it('removes a save that commits first and rejects a save that arrives after deletion', async () => {
    const firstCookie = await verifiedSession(
      baseUrl,
      mail,
      'gone-first',
      'gone-first@example.com',
    );
    const removed = await overlap(pool, {
      leader: (client, release, ready) =>
        saveOwnedEvent(
          client,
          firstCookie,
          undefined,
          none('Early', '2026-06-12', '09:00', '10:00'),
          {
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) => deleteOwnedAccount(client, firstCookie),
    });
    expect(removed.leader.body.result).toBe('ok');
    expect(removed.follower.result).toBe('ok');
    expect(await idByTitle(pool, 'Early')).toBe('');
    expect(await retired(pool, 'gone-first')).toBe(true);

    const secondCookie = await verifiedSession(
      baseUrl,
      mail,
      'gone-later',
      'gone-later@example.com',
    );
    const saveClient = await pool.connect();
    const held = deferred<void>();
    const ready = deferred<void>();
    try {
      const pending = saveOwnedEvent(
        saveClient,
        secondCookie,
        undefined,
        none('Late', '2026-06-12', '11:00', '12:00'),
        {
          beforeAccountLock: async () => {
            ready.resolve();
            await held.promise;
          },
        },
      );
      await ready.promise;
      const deleted = await pool.connect();
      try {
        expect((await deleteOwnedAccount(deleted, secondCookie)).result).toBe('ok');
      } finally {
        deleted.release();
      }
      held.resolve();
      const saved = await pending;
      expect(saved.status).toBe(409);
      expect(saved.body).toEqual({ result: 'account_gone' });
    } finally {
      held.resolve();
      saveClient.release();
    }
    expect(await idByTitle(pool, 'Late')).toBe('');
  });

  it('drops an open save when recovery commits and keeps a save that already committed', async () => {
    const cookie = await verifiedSession(baseUrl, mail, 'recover', 'recover@example.com');
    expect((await save(baseUrl, cookie, none('Kept', '2026-06-02', '09:00', '10:00'))).status).toBe(
      200,
    );
    const keptId = await idByTitle(pool, 'Kept');
    const proof = await recoveryProof(baseUrl, mail, 'recover@example.com');
    const openSave = await pool.connect();
    const held = deferred<void>();
    const ready = deferred<void>();
    try {
      const pending = saveOwnedEvent(
        openSave,
        cookie,
        keptId,
        none('Lost', '2026-06-02', '15:00', '16:00'),
        {
          beforeAccountLock: async () => {
            ready.resolve();
            await held.promise;
          },
        },
      );
      await ready.promise;
      const recovery = await pool.connect();
      try {
        expect(
          await completeRecovery(recovery, {
            email: 'recover@example.com',
            password: 'next-phrase',
            proof,
          }),
        ).toBe('ok');
      } finally {
        recovery.release();
      }
      held.resolve();
      expect((await pending).body).toEqual({ result: 'logged_out' });
    } finally {
      held.resolve();
      openSave.release();
    }
    expect((await eventRow(pool, keptId)).title).toBe('Kept');

    const again = await verifiedSession(baseUrl, mail, 'recover-kept', 'recover-kept@example.com');
    expect((await save(baseUrl, again, none('Stays', '2026-06-02', '09:00', '10:00'))).status).toBe(
      200,
    );
    const staysId = await idByTitle(pool, 'Stays');
    const secondProof = await recoveryProof(baseUrl, mail, 'recover-kept@example.com');
    const raced = await overlap(pool, {
      leader: (client, release, ready) =>
        saveOwnedEvent(
          client,
          again,
          staysId,
          none('Stays edited', '2026-06-02', '11:00', '12:00'),
          {
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) =>
        completeRecovery(client, {
          email: 'recover-kept@example.com',
          password: 'next-phrase',
          proof: secondProof,
        }),
    });
    expect(raced.leader.body.result).toBe('ok');
    expect(raced.follower).toBe('ok');
    expect((await eventRow(pool, staysId)).title).toBe('Stays edited');
    const ended = await pool.query<{ ended: boolean }>(
      `SELECT ended_at IS NOT NULL AS ended FROM sessions
       WHERE account_id = (SELECT id FROM accounts WHERE email = 'recover-kept@example.com')`,
    );
    expect(ended.rows.every((row) => row.ended)).toBe(true);
  });

  it('lets verification or cancellation win when it commits first', async () => {
    const verifyCode = await registerOnly(baseUrl, mail, 'verify-wins', 'verify-wins@example.com');
    const verifyFirst = await overlap(pool, {
      leader: (client, release, ready) =>
        verifyProof(client, verifyCode, async () => {
          ready();
          await release;
        }),
      follower: (client) => cancelRegistration(client, 'verify-wins@example.com', 'secret-phrase'),
    });
    expect(verifyFirst).toEqual({ leader: 'ok', follower: 'cancellation_rejected' });
    expect(await accountState(pool, 'verify-wins')).toEqual({ verified: true, calendars: 1 });

    const cancelCode = await registerOnly(baseUrl, mail, 'cancel-wins', 'cancel-wins@example.com');
    const cancelFirst = await overlap(pool, {
      leader: (client, release, ready) =>
        cancelRegistration(client, 'cancel-wins@example.com', 'secret-phrase', async () => {
          ready();
          await release;
        }),
      follower: (client) => verifyProof(client, cancelCode),
    });
    expect(cancelFirst).toEqual({ leader: 'ok', follower: 'verification_rejected' });
    expect(await accountState(pool, 'cancel-wins')).toEqual({ verified: false, calendars: 0 });
  });

  it('keeps a later detachment and does not let a later series save delete it', async () => {
    const cookie = await verifiedSession(baseUrl, mail, 'detach', 'detach@example.com');
    expect(
      (await save(baseUrl, cookie, series('DetachA', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const firstId = await idByTitle(pool, 'DetachA');
    const detachLater = await overlap(pool, {
      leader: (client, release, ready) =>
        saveOwnedEvent(
          client,
          cookie,
          firstId,
          series('DetachA', 'weekly', '2026-06-03', '10:00', '11:00'),
          {
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) =>
        detachOwnedEvent(client, cookie, firstId, {
          title: 'SoloA',
          start: { date: '2026-06-03', time: '09:00' },
          end: { date: '2026-06-03', time: '10:00' },
          originalStart: '2026-06-03T13:00:00.000Z',
        }),
    });
    expect(detachLater.leader.body.result).toBe('ok');
    expect(detachLater.follower.body.result).toBe('ok');
    expect(await detached(pool, 'SoloA')).toEqual({
      start: '2026-06-03T13:00:00.000Z',
      end: '2026-06-03T14:00:00.000Z',
      seriesId: firstId,
    });

    expect(
      (await save(baseUrl, cookie, series('DetachB', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const secondId = await idByTitle(pool, 'DetachB');
    const saveLater = await overlap(pool, {
      leader: (client, release, ready) =>
        detachOwnedEvent(
          client,
          cookie,
          secondId,
          {
            title: 'SoloB',
            start: { date: '2026-06-03', time: '09:00' },
            end: { date: '2026-06-03', time: '10:00' },
            originalStart: '2026-06-03T13:00:00.000Z',
          },
          {
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) =>
        saveOwnedEvent(
          client,
          cookie,
          secondId,
          series('DetachB', 'weekly', '2026-06-03', '11:00', '12:00'),
        ),
    });
    expect(saveLater.leader.body.result).toBe('ok');
    expect(saveLater.follower.body.result).toBe('ok');
    expect((await detached(pool, 'SoloB')).seriesId).toBe(secondId);
    expect(await localStart(pool, secondId)).toBe('11:00:00');
  });

  it('keeps an absence whether the series save commits first or later', async () => {
    const cookie = await verifiedSession(baseUrl, mail, 'absent', 'absent@example.com');
    expect(
      (await save(baseUrl, cookie, series('AbsA', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const firstId = await idByTitle(pool, 'AbsA');
    const absenceLater = await overlap(pool, {
      leader: (client, release, ready) =>
        saveOwnedEvent(
          client,
          cookie,
          firstId,
          series('AbsA', 'weekly', '2026-06-03', '10:00', '11:00'),
          {
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) =>
        deleteOwnedOccurrence(client, cookie, firstId, {
          originalStart: '2026-06-03T13:00:00.000Z',
        }),
    });
    expect(absenceLater.leader.body.result).toBe('ok');
    expect(absenceLater.follower.body.result).toBe('ok');
    expect(await absenceInstant(pool, firstId)).toBe('2026-06-03T13:00:00.000Z');

    expect(
      (await save(baseUrl, cookie, series('AbsB', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const secondId = await idByTitle(pool, 'AbsB');
    const saveLater = await overlap(pool, {
      leader: (client, release, ready) =>
        deleteOwnedOccurrence(
          client,
          cookie,
          secondId,
          { originalStart: '2026-06-03T13:00:00.000Z' },
          {
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) =>
        saveOwnedEvent(
          client,
          cookie,
          secondId,
          series('AbsB', 'weekly', '2026-06-03', '11:00', '12:00'),
        ),
    });
    expect(saveLater.leader.body.result).toBe('ok');
    expect(saveLater.follower.body.result).toBe('ok');
    expect(await absenceInstant(pool, secondId)).toBe('2026-06-03T13:00:00.000Z');
    expect(await localStart(pool, secondId)).toBe('11:00:00');
  });

  it('does not give a retired username to a registration that loses the lock', async () => {
    const cookie = await verifiedSession(baseUrl, mail, 'retire-me', 'retire-me@example.com');
    const leaderClient = await pool.connect();
    const release = deferred<void>();
    const entered = deferred<void>();
    const deletion = deleteOwnedAccount(leaderClient, cookie, {
      afterLock: async () => {
        entered.resolve();
        await release.promise;
      },
    });
    await entered.promise;
    const registration = post(baseUrl, '/api/registrations', {
      username: 'retire-me',
      email: 'fresh-retire@example.com',
      password: 'secret-phrase',
      timezone: 'America/New_York',
    });
    await waitForLock(pool);
    release.resolve();
    expect((await deletion).result).toBe('ok');
    expect(await registration).toEqual({
      status: 400,
      body: { result: 'registration_rejected' },
    });
    leaderClient.release();
    expect(await retired(pool, 'retire-me')).toBe(true);
    const created = await pool.query(
      `SELECT 1 FROM accounts WHERE email = 'fresh-retire@example.com'`,
    );
    expect(created.rowCount).toBe(0);
  });

  it('leaves one usable recovery proof when two starts commit', async () => {
    const email = 'two-proofs@example.com';
    await verifiedSession(baseUrl, mail, 'two-proofs', email);
    const raced = await overlap(pool, {
      leader: (client, release, ready) =>
        startRecovery(client, mail, email, async () => {
          ready();
          await release;
        }),
      follower: (client) => startRecovery(client, mail, email),
    });
    expect(raced.leader).toBe('login_rejected');
    expect(raced.follower).toBe('login_rejected');
    const proofs = await pool.query<{ usable: number; superseded: number }>(
      `SELECT
         count(*) FILTER (WHERE used_at IS NULL AND superseded_at IS NULL)::int AS usable,
         count(*) FILTER (WHERE superseded_at IS NOT NULL)::int AS superseded
       FROM proofs
       WHERE purpose = 'recovery'
         AND account_id = (SELECT id FROM accounts WHERE email = $1)`,
      [email],
    );
    expect(proofs.rows[0]).toEqual({ usable: 1, superseded: 1 });
  });

  it('freezes the template and timezone that each transaction locked', async () => {
    const zoneCookie = await verifiedSession(baseUrl, mail, 'zone-first', 'zone-first@example.com');
    expect(
      (await save(baseUrl, zoneCookie, series('Zone', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const zoneId = await idByTitle(pool, 'Zone');
    const zoneFirst = await overlap(pool, {
      leader: (client, release, ready) =>
        changeOwnedTimezone(client, zoneCookie, { timezone: 'America/Los_Angeles' }, now, {
          afterLock: async () => {
            ready();
            await release;
          },
        }),
      follower: (client) =>
        saveOwnedEvent(
          client,
          zoneCookie,
          zoneId,
          series('Zone', 'weekly', '2026-06-03', '10:00', '11:00'),
          { now },
        ),
    });
    expect(zoneFirst.leader.result).toBe('ok');
    expect(zoneFirst.follower.body.result).toBe('ok');
    expect(await accountTimezone(pool, 'zone-first@example.com')).toBe('America/Los_Angeles');
    expect(await freezeStarts(pool, zoneId)).toEqual([
      '2026-06-03T13:00:00.000Z',
      '2026-06-10T13:00:00.000Z',
    ]);
    expect(await localStart(pool, zoneId)).toBe('10:00:00');

    const saveCookie = await verifiedSession(baseUrl, mail, 'save-first', 'save-first@example.com');
    expect(
      (await save(baseUrl, saveCookie, series('Saved', 'weekly', '2026-06-03', '09:00', '10:00')))
        .status,
    ).toBe(200);
    const savedId = await idByTitle(pool, 'Saved');
    const saveFirst = await overlap(pool, {
      leader: (client, release, ready) =>
        saveOwnedEvent(
          client,
          saveCookie,
          savedId,
          series('Saved', 'weekly', '2026-06-03', '15:00', '16:00'),
          {
            now,
            afterLock: async () => {
              ready();
              await release;
            },
          },
        ),
      follower: (client) =>
        changeOwnedTimezone(client, saveCookie, { timezone: 'America/Los_Angeles' }, now),
    });
    expect(saveFirst.leader.body.result).toBe('ok');
    expect(saveFirst.follower.result).toBe('ok');
    expect(await accountTimezone(pool, 'save-first@example.com')).toBe('America/Los_Angeles');
    expect(await freezeStarts(pool, savedId)).toEqual([
      '2026-06-03T13:00:00.000Z',
      '2026-06-10T13:00:00.000Z',
    ]);
    expect(await localStart(pool, savedId)).toBe('15:00:00');
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

function none(title: string, date: string, start: string, end: string) {
  return { title, repetition: 'none', start: { date, time: start }, end: { date, time: end } };
}

function series(title: string, repetition: string, date: string, start: string, end: string) {
  return {
    title,
    repetition,
    start: { date, time: start },
    end: { date, time: end },
  };
}

async function overlap<T, U>(
  pool: Pool,
  work: {
    leader: (client: PoolClient, release: Promise<void>, ready: () => void) => Promise<T>;
    follower: (client: PoolClient) => Promise<U>;
  },
): Promise<{ leader: T; follower: U }> {
  const leaderClient = await pool.connect();
  const followerClient = await pool.connect();
  const release = deferred<void>();
  const entered = deferred<void>();
  try {
    const leader = work.leader(leaderClient, release.promise, () => entered.resolve());
    await entered.promise;
    const follower = work.follower(followerClient);
    await waitForLock(pool);
    release.resolve();
    return { leader: await leader, follower: await follower };
  } finally {
    release.resolve();
    leaderClient.release();
    followerClient.release();
  }
}

async function verifiedSession(
  baseUrl: string,
  mail: RecordingMail,
  username: string,
  email: string,
) {
  const code = await registerOnly(baseUrl, mail, username, email);
  expect(await post(baseUrl, '/api/registrations/verify', { code })).toEqual({
    status: 200,
    body: { result: 'ok' },
  });
  return login(baseUrl, email);
}

async function registerOnly(baseUrl: string, mail: RecordingMail, username: string, email: string) {
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

async function recoveryProof(baseUrl: string, mail: RecordingMail, email: string) {
  const before = mail.messages.length;
  const response = await post(baseUrl, '/api/recoveries', { email });
  expect(response).toEqual({ status: 400, body: { result: 'login_rejected' } });
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

async function save(baseUrl: string, cookie: string, body: unknown) {
  const response = await fetch(`${baseUrl}/api/events`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as { result: string } };
}

async function idByTitle(pool: Pool, title: string): Promise<string> {
  const result = await pool.query<{ id: string }>('SELECT id FROM events WHERE title = $1', [
    title,
  ]);
  return result.rows[0]?.id ?? '';
}

async function eventRow(pool: Pool, id: string) {
  const result = await pool.query<{
    title: string;
    location: string;
    description: string;
    visibility: string;
    start_instant: Date;
    end_instant: Date;
  }>(
    `SELECT title, location, description, visibility, start_instant, end_instant
     FROM events WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  return {
    title: row?.title ?? '',
    location: row?.location ?? '',
    description: row?.description ?? '',
    visibility: row?.visibility ?? '',
    start: row?.start_instant.toISOString() ?? '',
    end: row?.end_instant.toISOString() ?? '',
  };
}

async function retired(pool: Pool, username: string): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM retired_usernames WHERE username = $1', [
    username,
  ]);
  return (result.rowCount ?? 0) > 0;
}

async function accountState(pool: Pool, username: string) {
  const result = await pool.query<{ verified: boolean; calendars: number }>(
    `SELECT accounts.verified_at IS NOT NULL AS verified, count(calendars.id)::int AS calendars
     FROM accounts
     LEFT JOIN calendars ON calendars.owner_account_id = accounts.id
     WHERE accounts.username = $1
     GROUP BY accounts.verified_at`,
    [username],
  );
  return result.rows[0] ?? { verified: false, calendars: 0 };
}

async function detached(pool: Pool, title: string) {
  const result = await pool.query<{
    start_instant: Date;
    end_instant: Date;
    detached_from_event_id: string;
  }>(
    `SELECT start_instant, end_instant, detached_from_event_id
     FROM events WHERE title = $1`,
    [title],
  );
  const row = result.rows[0];
  return {
    start: row?.start_instant.toISOString() ?? '',
    end: row?.end_instant.toISOString() ?? '',
    seriesId: row?.detached_from_event_id ?? '',
  };
}

async function localStart(pool: Pool, id: string): Promise<string> {
  const result = await pool.query<{ local_start: string }>(
    'SELECT local_start::text FROM events WHERE id = $1',
    [id],
  );
  return result.rows[0]?.local_start ?? '';
}

async function absenceInstant(pool: Pool, seriesId: string): Promise<string> {
  const result = await pool.query<{ original_start_instant: Date }>(
    'SELECT original_start_instant FROM series_absences WHERE series_event_id = $1',
    [seriesId],
  );
  return result.rows[0]?.original_start_instant.toISOString() ?? '';
}

async function accountTimezone(pool: Pool, email: string): Promise<string> {
  const result = await pool.query<{ timezone: string }>(
    'SELECT timezone FROM accounts WHERE email = $1',
    [email],
  );
  return result.rows[0]?.timezone ?? '';
}

async function freezeStarts(pool: Pool, seriesId: string): Promise<string[]> {
  const result = await pool.query<{ start_instant: Date }>(
    `SELECT start_instant FROM series_freezes
     WHERE series_event_id = $1
     ORDER BY start_instant`,
    [seriesId],
  );
  return result.rows.map((row) => row.start_instant.toISOString());
}

async function waitForLock(pool: Pool): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const locks = await pool.query(
      `SELECT 1 FROM pg_locks
       WHERE NOT granted AND locktype IN ('tuple', 'transactionid', 'advisory')
       LIMIT 1`,
    );
    if ((locks.rowCount ?? 0) > 0) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
  }
  throw new Error('the follower did not wait on the locked row');
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
