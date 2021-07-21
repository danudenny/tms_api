//#region import
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import {
    Transactional,
} from '../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { AuthenticatedGuard } from '../../../shared/guards/authenticated.guard';
import { AuthService } from '../../../shared/services/auth.service';
import {
    AuthLoginByEmailOrUsernamePayloadVM, AuthLoginOtpByEmailOrUsernamePayloadVM, AuthLoginResponseVM, AuthLoginWithRolesResponseVM,
    GetOtpPayloadVM,
    LoginChannelOtpAddressesResponse,
    PermissionAccessPayloadVM, PermissionAccessResponseVM, PermissionRolesPayloadVM,
    PermissionRolesResponseVM,
    validateOtpPayloadVM,
} from '../models/auth.vm';
import {
    RefreshAccessTokenPayload, RefreshTokenLogoutPayload,
} from '../models/refresh-access-token.model';
import moment = require('moment');
//#endregion

@ApiUseTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async authLogin(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
    return await this.authService.login(
      payload.clientId,
      payload.username,
      payload.password,
      payload.email,
    );
  }

  @Post('loginWithRoles')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthLoginWithRolesResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async authLoginWithRoles(
    @Body() payload: AuthLoginByEmailOrUsernamePayloadVM,
  ) {
    return await this.authService.login(
      payload.clientId,
      payload.email,
      payload.password,
      payload.username,
    );
  }

  @Post('permissionAccess')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PermissionAccessResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async permissionAccess(@Body() payload: PermissionAccessPayloadVM) {
    return await this.authService.permissionAccess(
      payload.clientId,
      payload.roleId,
      payload.branchId,
    );
  }

  @Post('permissionRoles')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PermissionRolesResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async permissionRoles(@Body() payload: PermissionRolesPayloadVM) {
    return await this.authService.permissionRoles();
  }

  @Post('refreshToken')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()
  public async refreshAccessToken(@Body() payload: RefreshAccessTokenPayload) {
    return await this.authService.refreshAccessToken(payload.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async authLogout(@Body() payload: RefreshTokenLogoutPayload) {
    return await this.authService.removeToken(payload.refreshToken);
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  public async ping() {
    return {
      message: 'pong',
      timeNow: moment().toDate(),
      timeString: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  // TODO: resetPassword user?? (master data / tms)
  // @Post('resetPassword')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // // @ApiOkResponse({ type: AuthLoginResponseVM })
  // public async resetPassword(
  //   @Param() id: string,
  //   @Body() payload: UserResetPassword,
  // ) {
  //   return null; // await this.authService.removeToken(id);
  // }
  @Post('v2/login/otp/channel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginChannelOtpAddressesResponse })
  @Transactional()
  public async authLoginMol(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
    return await this.authService.loginOtpChannel(
      payload.clientId,
      payload.username,
      payload.password,
      payload.email,
    );
  }

  @Post('v2/login/otp/get-otp')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  public async getOtp(@Body() payload: GetOtpPayloadVM) {
    return await this.authService.getOtp(
      payload.token, payload.channel
    );
  }

  @Post('v2/login/otp/validate-otp')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  public async validateOtp(@Body() payload: validateOtpPayloadVM) {
    return await this.authService.validateOtp(
      payload.code, payload.token
    );
  }

}
