import { Body, Controller, Delete, Headers, Inject, Post, Res } from '@nestjs/common';
import { SessionService } from './session.service';

type StatusResponse = {
  status(code: number): { json(body: unknown): void };
  setHeader(name: string, value: string): void;
};

@Controller('api/sessions')
export class SessionsController {
  constructor(@Inject(SessionService) private readonly sessions: SessionService) {}

  @Post()
  async create(@Body() body: unknown, @Res() response: StatusResponse): Promise<void> {
    const outcome = await this.sessions.login(body);
    if (outcome.cookie !== undefined) {
      response.setHeader('Set-Cookie', outcome.cookie);
    }
    response.status(outcome.status).json(outcome.body);
  }

  @Delete('current')
  async destroy(
    @Headers('cookie') cookie: string | undefined,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.sessions.logout(cookie);
    response.status(outcome.status).json(outcome.body);
  }
}
