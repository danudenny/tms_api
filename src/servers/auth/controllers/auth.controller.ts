import { Body, Controller, Get, Post, UseGuards, forwardRef, Inject, Injectable } from '@nestjs/common';

import { ApiOkResponse, ApiUseTags } from '@nestjs/swagger';
import { Transactional } from '../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { AuthenticatedGuard } from "../../../shared/guards/authenticated.guard";
import { AuthService } from '../../../shared/services/auth.service';
import { AuthLoginByEmailOrUsernamePayloadVM, AuthLoginResponseVM } from '../models/auth.vm';
import { RefreshAccessTokenPayload } from '../models/refresh-access-token.model';

@ApiUseTags('Authentication')
@Controller('api/auth')
@Injectable()
export class AuthController {
  AuthService: any;
  authService: any;
  // constructor(private readonly authService: AuthService) {}
  constructor(@Inject(forwardRef(() => AuthService)) private readonly a: AuthService) {}
  @Post('login')
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()
  public async authLogin(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
    const loginMetadata = await this.AuthService.refreshAccessToken(
      // payload.clientId,
      payload.employee_id,
     
    );
    return loginMetadata;
  }

  @Post('refresh-access-token')
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()
  public async refreshAccessToken(@Body() payload: RefreshAccessTokenPayload) {
    const newLoginMetadata = await this.authService.refreshAccessToken(payload.refreshToken);

    return newLoginMetadata;
  }

  @Get('validate-token')
  @ApiOkResponse({ type: Boolean })
  @UseGuards(AuthenticatedGuard)
  public async authValidateToken() {
    return true; // Just return true, the duty is on AuthMiddleware
  }
}
