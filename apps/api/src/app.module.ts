import {
  Inject,
  Injectable,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import type { Pool } from 'pg';
import { AccountController } from './account/account.controller';
import { CalendarController } from './calendar/calendar.controller';
import { CalendarService } from './calendar/calendar.service';
import { AccountService } from './account/account.service';
import { DATABASE_POOL } from './db/pool-token';
import { EVENT_CLOCK, EventService } from './events/event.service';
import { EventsController } from './events/events.controller';
import { HealthController } from './health.controller';
import { MAIL_PORT } from './mail/mail-token';
import type { MailPort } from './mail/protocol';
import { SECURE_SESSION_COOKIE } from './session/session-token';
import { SessionService } from './session/session.service';
import { SessionsController } from './session/sessions.controller';
import { RecoveryService } from './recovery/recovery.service';
import { RecoveriesController } from './recovery/recoveries.controller';
import { CancellationService } from './registration/cancellation.service';
import { RegistrationService } from './registration/registration.service';
import { RegistrationsController } from './registration/registrations.controller';
import { VerificationService } from './registration/verification.service';

@Module({ controllers: [HealthController] })
export class AppModule {}

@Injectable()
class ClosePool implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

export function createApplication(options: {
  pool: Pool;
  mail: MailPort;
  secureCookie?: boolean;
  now?: () => Date;
}): DynamicModule {
  return {
    module: AppModule,
    controllers: [
      HealthController,
      RegistrationsController,
      SessionsController,
      RecoveriesController,
      AccountController,
      CalendarController,
      EventsController,
    ],
    providers: [
      RegistrationService,
      VerificationService,
      CancellationService,
      SessionService,
      RecoveryService,
      AccountService,
      CalendarService,
      EventService,
      ClosePool,
      { provide: DATABASE_POOL, useValue: options.pool },
      { provide: MAIL_PORT, useValue: options.mail },
      { provide: SECURE_SESSION_COOKIE, useValue: options.secureCookie ?? false },
      { provide: EVENT_CLOCK, useValue: options.now ?? (() => new Date()) },
    ],
  };
}
