import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Pool, PoolClient } from 'pg';
import { applyMigrations, createPersonalTimePool, migrationsDirectory } from '../db/connection';
import { runProofSend, type MailPort, type ProofMessage } from './protocol';

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

describe('mail lock', () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'personal-time-mail-'));
  const port = 54330;
  const postgres = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false,
  });
  let pool: Pool;

  beforeAll(async () => {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase('personal_time');
    pool = createPersonalTimePool(`postgresql://postgres:postgres@127.0.0.1:${port}/personal_time`);
    const client = await pool.connect();
    try {
      await applyMigrations(client, migrationsDirectory());
      await client.query('CREATE TABLE probe (id integer PRIMARY KEY, note text NOT NULL)');
    } finally {
      client.release();
    }
  }, 120_000);

  afterAll(async () => {
    await pool.end();
    await postgres.stop();
  });

  it('writes nothing when the port cannot send, then asks again and can succeed', async () => {
    let asked = 0;
    const unable: MailPort = {
      canSend() {
        asked += 1;
        return Promise.resolve(false);
      },
      sendProof() {
        return Promise.resolve('accepted');
      },
    };
    const logs: string[] = [];
    const client = await pool.connect();
    try {
      const outcome = await send(client, unable, logs, 'ada@example.com');
      expect(outcome).toEqual({ status: 503, body: { result: 'send_failed' } });
      expect(await probeCount(pool)).toBe(0);
      expect(logs.join('\n')).not.toContain('ada@example.com');
    } finally {
      client.release();
    }

    const able: MailPort = {
      canSend() {
        asked += 1;
        return Promise.resolve(true);
      },
      sendProof(message: ProofMessage) {
        expect(message.to).toBe('ada@example.com');
        return Promise.resolve('accepted');
      },
    };
    const again = await pool.connect();
    try {
      const outcome = await send(again, able, [], 'ada@example.com');
      expect(outcome.body.result).toBe('ok');
      expect(await probeCount(pool)).toBe(1);
      expect(asked).toBe(2);
    } finally {
      again.release();
      await pool.query('DELETE FROM probe');
    }
  });

  it('rolls back a rejected message and fails the waiter too', async () => {
    let release: ((value: 'rejected') => void) | undefined;
    let sending = false;
    const held = new Promise<'rejected'>((resolve) => {
      release = resolve;
    });
    const mail: MailPort = {
      canSend() {
        return Promise.resolve(true);
      },
      sendProof() {
        sending = true;
        return held;
      },
    };
    const firstClient = await pool.connect();
    const secondClient = await pool.connect();
    const firstLogs: string[] = [];
    const first = send(firstClient, mail, firstLogs, 'ada@example.com');
    await waitUntil(() => sending);
    const second = send(secondClient, mail, [], 'bee@example.com');
    await waitForUngrantedLock(pool);
    release?.('rejected');
    const [leader, waiter] = await Promise.all([first, second]);
    firstClient.release();
    secondClient.release();
    expect(leader).toEqual({ status: 503, body: { result: 'send_failed' } });
    expect(waiter).toEqual({ status: 503, body: { result: 'send_failed' } });
    expect(await probeCount(pool)).toBe(0);
    expect(firstLogs.join('\n')).toContain('send failed');
    expect(firstLogs.join('\n')).not.toContain('ada@example.com');
    expect(firstLogs.join('\n')).not.toContain('bee@example.com');
  });

  it('returns operation_failed after an accepted message when commit fails', async () => {
    await pool.query(`
      CREATE OR REPLACE FUNCTION probe_reject_commit() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'provider failed for ada@example.com stack Error';
      END $$ LANGUAGE plpgsql
    `);
    await pool.query(`
      CREATE CONSTRAINT TRIGGER probe_reject
      AFTER INSERT ON probe
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION probe_reject_commit()
    `);
    const logs: string[] = [];
    const client = await pool.connect();
    try {
      const outcome = await send(
        client,
        {
          canSend() {
            return Promise.resolve(true);
          },
          sendProof() {
            return Promise.resolve('accepted');
          },
        },
        logs,
        'ada@example.com',
      );
      expect(outcome).toEqual({ status: 500, body: { result: 'operation_failed' } });
      expect(JSON.stringify(outcome.body)).not.toContain('ada@example.com');
      expect(JSON.stringify(outcome.body)).not.toContain('stack');
      expect(logs.join('\n')).not.toContain('ada@example.com');
      expect(await probeCount(pool)).toBe(0);
    } finally {
      client.release();
      await pool.query('DROP TRIGGER probe_reject ON probe');
    }
  });
});

function send(
  client: PoolClient,
  port: MailPort,
  logs: string[],
  recipient: string,
): Promise<{ status: number; body: { result: string } }> {
  return runProofSend({
    client,
    port,
    operation: 'register',
    waitMs: 1_000,
    log(line) {
      logs.push(line);
    },
    prepare(db) {
      return db
        .query('INSERT INTO probe (id, note) VALUES (1, $1)', [recipient])
        .then(() => ({ action: 'send' as const, message: { to: recipient, code: 'proof-code' } }));
    },
  });
}

async function probeCount(pool: Pool): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT count(*)::text AS count FROM probe');
  return Number(result.rows[0]?.count ?? 0);
}

async function waitUntil(ready: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (ready()) {
      return;
    }
    await delay(20);
  }
  throw new Error('the mail call did not start');
}

async function waitForUngrantedLock(pool: Pool): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const locks = await pool.query(
      "SELECT 1 FROM pg_locks WHERE locktype = 'advisory' AND NOT granted LIMIT 1",
    );
    if ((locks.rowCount ?? 0) > 0) {
      return;
    }
    await delay(20);
  }
  throw new Error('the waiter did not block on the mail lock');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
