//#region import
import { Body, Controller, Get, HttpCode, HttpStatus, Post} from '@nestjs/common';
import { AuthV2Service } from '../../../../shared/services/v2/auth-v2.service';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import {
    Transactional,
} from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import {
    AuthLoginByEmailOrUsernamePayloadVM,
    AuthLoginV2ResponseVM,
    GetOtpPayloadVM,
    LoginChannelOtpAddressesResponse,
    validateOtpPayloadVM,
} from '../../models/auth.vm';
import { RefreshAccessTokenPayload } from '../../models/refresh-access-token.model';
//#endregion

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
  public async validateOtp(@Body() payload: validateOtpPayloadVM) {
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

  @Post('set/version')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  public async setLoginVersion(@Body() payload: any) {
    return await this.authv2Service.setLoginVersion(payload);
  }

  @Get('version')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  public async checkIsNewVersionLogin() {
    return await this.authv2Service.checkIsNewVersionLogin();
  }
}
