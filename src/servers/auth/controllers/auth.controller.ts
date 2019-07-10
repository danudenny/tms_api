import { Body, Controller, Get, Post, UseGuards, Logger, HttpCode, HttpStatus } from '@nestjs/common';

import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
// import { AuthenticatedAuthGuard } from '../../../shared/guards/anonymous.guard';
import { AuthService } from '../../../shared/services/auth.service';
import {
  AuthLoginByEmailOrUsernamePayloadVM,
  AuthLoginResponseVM,
  AuthLoginWithRolesResponseVM,
  PermissionRolesPayloadVM,
  PermissionRolesResponseVM,
  PermissionAccessPayloadVM,
  PermissionAccessResponseVM,
} from '../models/auth.vm';
import { AuthenticatedGuard } from '../../../shared/guards/authenticated.guard';
import { RefreshAccessTokenPayload } from '../models/refresh-access-token.model';

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
    const loginMetadata = await this.authService.login(
      payload.clientId,
      payload.username,
      payload.password,
      payload.email,
    );

    return loginMetadata;
  }

  @Post('loginWithRoles')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthLoginWithRolesResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async authLoginWithRoles(
    @Body() payload: AuthLoginByEmailOrUsernamePayloadVM,
  ) {
    const loginMetadata = await this.authService.login(
      payload.clientId,
      payload.email,
      payload.password,
      payload.username,
    );

    return loginMetadata;
  }

  @Post('permissionAccess')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PermissionAccessResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async permissionAccess(@Body() payload: PermissionAccessPayloadVM) {
    const result = await this.authService.permissionAccess(
      payload.clientId,
      payload.roleId,
      payload.branchId,
    );

    return result;
  }

  @Post('permissionRoles')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PermissionRolesResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async permissionRoles(@Body() payload: PermissionRolesPayloadVM) {
    const result = await this.authService.permissionRoles();
    // await this.authService.permissionRoles(
    //   payload.clientId,
    // );

    return result;
  }

  @Post('refreshToken')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()
  public async refreshAccessToken(@Body() payload: RefreshAccessTokenPayload) {
    const newLoginMetadata = await this.authService.refreshAccessToken(
      payload.refreshToken,
    );

    return newLoginMetadata;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @Transactional()
  public async authLogout(@Body() payload: RefreshAccessTokenPayload) {
    const response = await this.authService.removeToken(payload.refreshToken);

    return response;
  }
}
