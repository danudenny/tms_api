import { Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import { AuthV2Service } from '../../../../shared/services/v2/auth-v2.service';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { RefreshAccessTokenPayload } from '../../models/refresh-access-token.model';
import {
    AuthLoginByEmailOrUsernamePayloadVM,
    AuthLoginV2ResponseVM,
    GetOtpPayloadVM,
    LoginChannelOtpAddressesResponse,
    ValidateOtpPayloadVM,
} from '../../models/auth.vm';

@ApiUseTags('AuthenticationV2')
@Controller('auth/v2')
export class AuthV2Controller {
  constructor(private readonly authv2Service: AuthV2Service) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginChannelOtpAddressesResponse })
  @Transactional()
  public async authLoginV2(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
    return await this.authv2Service.loginV2(
      payload.clientId,
      payload.username,
      payload.password,
      payload.email,
    );
  }

  @Post('otp')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  public async getOtp(@Body() payload: GetOtpPayloadVM) {
    return await this.authv2Service.getOtp(
      payload.token, payload.channel
    );
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthLoginV2ResponseVM })
  @Transactional()
  public async validateOtp(@Body() payload: ValidateOtpPayloadVM) {
    return await this.authv2Service.validateOtp(
      payload.code, payload.token
    );
  }

  @Post('refreshToken')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthLoginV2ResponseVM })
  @Transactional()
  public async refreshAccessTokenV2(@Body() payload: RefreshAccessTokenPayload) {
    return await this.authv2Service.refreshAccessTokenV2(payload.refreshToken);
  }
}
