//#region import
import { Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import { AuthV2Service } from '../../../../shared/services/v2/auth-v2.service';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import {
    Transactional,
} from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import {
    AuthLoginByEmailOrUsernamePayloadVM,
    AuthLoginResponseVM,
    GetOtpPayloadVM,
    LoginChannelOtpAddressesResponse,
    validateOtpPayloadVM,
} from '../../models/auth.vm';
import { AuthService } from 'src/shared/services/auth.service';
//#endregion

@ApiUseTags('AuthenticationV2')
@Controller('auth/v2')
export class AuthV2Controller {
  constructor(private readonly authv2Service: AuthV2Service) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginChannelOtpAddressesResponse })
  @Transactional()
  public async authLoginMol(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
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
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()
  public async validateOtp(@Body() payload: validateOtpPayloadVM) {
    return await this.authv2Service.validateOtp(
      payload.code, payload.token
    );
  }
}
