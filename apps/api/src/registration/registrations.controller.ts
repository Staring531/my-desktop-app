import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { CancellationService } from './cancellation.service';
import { RegistrationService } from './registration.service';
import { VerificationService } from './verification.service';

type StatusResponse = {
  status(code: number): { json(body: unknown): void };
};

@Controller('api/registrations')
export class RegistrationsController {
  constructor(
    @Inject(RegistrationService) private readonly registrations: RegistrationService,
    @Inject(VerificationService) private readonly verification: VerificationService,
    @Inject(CancellationService) private readonly cancellation: CancellationService,
  ) {}

  @Post('cancel')
  async cancel(@Body() body: unknown, @Res() response: StatusResponse): Promise<void> {
    const outcome = await this.cancellation.cancel(body);
    response.status(outcome.status).json(outcome.body);
  }

  @Post('verify')
  async verify(@Body() body: unknown, @Res() response: StatusResponse): Promise<void> {
    const outcome = await this.verification.verify(body);
    response.status(outcome.status).json(outcome.body);
  }

  @Post()
  async create(@Body() body: unknown, @Res() response: StatusResponse): Promise<void> {
    const outcome = await this.registrations.register(body);
    response.status(outcome.status).json(outcome.body);
  }
}
