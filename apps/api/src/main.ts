import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule, createApplication } from './app.module';
import { createPersonalTimePool } from './db/connection';
import { unavailableMail } from './mail/unavailable';

async function bootstrap(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  const app = await NestFactory.create(
    databaseUrl === undefined || databaseUrl === ''
      ? AppModule
      : createApplication({
          pool: createPersonalTimePool(databaseUrl),
          mail: unavailableMail,
          secureCookie: process.env.SESSION_COOKIE_SECURE === 'true',
        }),
  );
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
