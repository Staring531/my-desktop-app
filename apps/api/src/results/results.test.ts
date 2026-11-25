import { describe, expect, it } from 'vitest';
import type { Pool } from 'pg';
import { AccountController } from '../account/account.controller';
import { CalendarController } from '../calendar/calendar.controller';
import { EventsController } from '../events/events.controller';
import { createApplication } from '../app.module';
import { HealthController } from '../health.controller';
import { unavailableMail } from '../mail/unavailable';
import { RegistrationsController } from '../registration/registrations.controller';
import { RecoveriesController } from '../recovery/recoveries.controller';
import { SessionsController } from '../session/sessions.controller';
import { formatOperationLog } from './log';
import { httpStatus, resultBody, type ResultName } from './results';
import { createProofCode, hashPassword, proofCodeMatches } from './secrets';

const forbidden = ['@', 'taken', 'password', 'stack', 'verified'];

describe('result bodies', () => {
  it('maps each documented result to its HTTP status', () => {
    expect(httpStatus).toEqual({
      ok: 200,
      registration_rejected: 400,
      verification_rejected: 400,
      cancellation_rejected: 400,
      login_rejected: 400,
      recovery_rejected: 400,
      send_failed: 503,
      operation_failed: 500,
      logged_out: 401,
      save_rejected: 400,
      not_found: 404,
      account_gone: 409,
    });
  });

  it('keeps failure bodies free of secrets and explanations', () => {
    const names = Object.keys(httpStatus) as ResultName[];
    for (const name of names) {
      if (name === 'ok') {
        continue;
      }
      const body = JSON.stringify(resultBody(name));
      expect(body).toBe(`{"result":"${name}"}`);
      for (const word of forbidden) {
        expect(body.toLowerCase()).not.toContain(word);
      }
    }
  });

  it('registers health and registration when the database application is created', () => {
    const application = createApplication({ pool: {} as Pool, mail: unavailableMail });
    expect(application.controllers).toEqual([
      HealthController,
      RegistrationsController,
      SessionsController,
      RecoveriesController,
      AccountController,
      CalendarController,
      EventsController,
    ]);
  });
});

describe('secrets and logs', () => {
  it('verifies a proof code only against its own hash', () => {
    const proof = createProofCode();
    expect(proof.code.length).toBeGreaterThanOrEqual(22);
    expect(proof.codeHash).not.toContain(proof.code);
    expect(proofCodeMatches(proof.code, proof.codeHash)).toBe(true);
    expect(proofCodeMatches(`${proof.code}x`, proof.codeHash)).toBe(false);
  });

  it('omits the password and the hash from the operation log', async () => {
    const password = 'correct horse battery';
    const passwordHash = await hashPassword(password);
    const line = formatOperationLog({ operation: 'register', result: 'registration_rejected' });
    expect(line).toBe('register result=registration_rejected');
    expect(line).not.toContain(password);
    expect(line).not.toContain(passwordHash);
    expect(await hashPassword(password)).not.toBe(passwordHash);
  });
});
