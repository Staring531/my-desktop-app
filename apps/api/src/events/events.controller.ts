import { Body, Controller, Delete, Headers, Inject, Param, Post, Put, Res } from '@nestjs/common';
import { EventService } from './event.service';

type StatusResponse = {
  status(code: number): { json(body: unknown): void };
};

@Controller('api/events')
export class EventsController {
  constructor(@Inject(EventService) private readonly events: EventService) {}

  @Put(':id')
  async update(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.events.save(cookie, id, body);
    response.status(outcome.status).json(outcome.body);
  }

  @Put()
  async create(
    @Headers('cookie') cookie: string | undefined,
    @Body() body: unknown,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.events.save(cookie, undefined, body);
    response.status(outcome.status).json(outcome.body);
  }

  @Post(':id/choices')
  async choose(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.events.choose(cookie, id, body);
    response.status(outcome.status).json(outcome.body);
  }

  @Post(':id/detach')
  async detach(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.events.detach(cookie, id, body);
    response.status(outcome.status).json(outcome.body);
  }

  @Delete(':id/occurrences')
  async deleteOccurrence(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Body() body: unknown,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.events.deleteOccurrence(cookie, id, body);
    response.status(outcome.status).json(outcome.body);
  }

  @Delete(':id')
  async remove(
    @Headers('cookie') cookie: string | undefined,
    @Param('id') id: string,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.events.remove(cookie, id);
    response.status(outcome.status).json(outcome.body);
  }
}
