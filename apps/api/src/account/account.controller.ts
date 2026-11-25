import { Body, Controller, Delete, Headers, Inject, Patch, Res } from '@nestjs/common';
import { AccountService } from './account.service';

type StatusResponse = {
  status(code: number): { json(body: unknown): void };
};

@Controller('api/account')
export class AccountController {
  constructor(@Inject(AccountService) private readonly accounts: AccountService) {}

  @Patch('timezone')
  async changeTimezone(
    @Headers('cookie') cookie: string | undefined,
    @Body() body: unknown,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.accounts.changeTimezone(cookie, body);
    response.status(outcome.status).json(outcome.body);
  }

  @Delete()
  async remove(
    @Headers('cookie') cookie: string | undefined,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.accounts.remove(cookie);
    response.status(outcome.status).json(outcome.body);
  }

  @Patch()
  async changeNickname(
    @Headers('cookie') cookie: string | undefined,
    @Body() body: unknown,
    @Res() response: StatusResponse,
  ): Promise<void> {
    const outcome = await this.accounts.changeNickname(cookie, body);
    response.status(outcome.status).json(outcome.body);
  }
}
