import { Controller, Get, Headers, Inject, Query, Res } from '@nestjs/common';
import { CalendarService } from './calendar.service';

type StatusResponse = {
  status(code: number): { json(body: unknown): void };
};

@Controller('api/calendar')
export class CalendarController {
  constructor(@Inject(CalendarService) private readonly calendars: CalendarService) {}

  @Get()
  async read(
    @Headers('cookie') cookie: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.calendars.read(cookie, from, to);
    response.status(outcome.status).json(outcome.body);
  }
}
