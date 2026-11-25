import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { RecoveryService } from './recovery.service';

type StatusResponse = {
  status(code: number): { json(body: unknown): void };
};

@Controller('api/recoveries')
export class RecoveriesController {
  constructor(@Inject(RecoveryService) private readonly recoveries: RecoveryService) {}

  @Post('complete')
  async complete(@Body() body: unknown, @Res() response: StatusResponse): Promise<void> {
    const outcome = await this.recoveries.complete(body);
    response.status(outcome.status).json(outcome.body);
  }

  @Post()
  async start(@Body() body: unknown, @Res() response: StatusResponse): Promise<void> {
    const outcome = await this.recoveries.start(body);
    response.status(outcome.status).json(outcome.body);
  }
}
