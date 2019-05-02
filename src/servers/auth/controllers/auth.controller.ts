import { Body, Controller, Get, Post, UseGuards, Logger, HttpCode } from '@nestjs/common';

import { ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
// import { AuthenticatedAuthGuard } from '../../../shared/guards/anonymous.guard';
import { AuthService } from '../../../shared/services/auth.service';
import { AuthLoginByEmailOrUsernamePayloadVM, AuthLoginResponseVM } from '../models/auth.vm';
// import { RefreshAccessTokenPayload } from '../models/refresh-access-token.model';

@ApiUseTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async authLogin(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
    const loginMetadata = await this.authService.login(
      payload.clientId,
      payload.email,
      payload.password,
      payload.username,
    );

    return loginMetadata;
  }

}
