import { Body, Controller, Get, Post, UseGuards, Logger, HttpCode } from '@nestjs/common';

import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
// import { AuthenticatedAuthGuard } from '../../../shared/guards/anonymous.guard';
import { AuthService } from '../../../shared/services/auth.service';
import { AuthLoginByEmailOrUsernamePayloadVM, AuthLoginResponseVM, AuthLoginWithRolesResponseVM, PermissionRolesPayloadVM, PermissionRolesResponseVM, PermissionAccessPayloadVM } from '../models/auth.vm';
import { AuthenticatedGuard } from 'src/shared/guards/authenticated.guard';
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

  @Post('loginWithRoles')
  @HttpCode(200)
  @ApiOkResponse({ type: AuthLoginWithRolesResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async authLoginWithRoles(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
    const loginMetadata = await this.authService.login(
      payload.clientId,
      payload.email,
      payload.password,
      payload.username,
    );

    return loginMetadata;
  }

  @Post('permissionAccess')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthLoginResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async permissionAccess(@Body() payload: PermissionAccessPayloadVM) {
    const loginMetadata = await this.authService.permissionAccess(
      payload.clientId,
      payload.roleId,
      payload.branchId,
    );

    return loginMetadata;
  }

  private newMethod(payload: PermissionAccessPayloadVM): any {
    return payload.clientId;
  }

  @Post('permissionRoles')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PermissionRolesResponseVM })
  @Transactional()

  // NOTE: body params like strong parameter
  public async permissionRoles(@Body() payload: PermissionRolesPayloadVM) {

    const loginMetadata = await this.authService.permissionRoles();
    // await this.authService.permissionRoles(
    //   payload.clientId,
    // );

    return loginMetadata;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOkResponse({})
  @Transactional()

  // NOTE: body params like strong parameter
  public async authLogout(@Body() payload: AuthLoginByEmailOrUsernamePayloadVM) {
    const loginMetadata = await this.authService.login(
      payload.clientId,
      payload.email,
      payload.password,
      payload.username,
    );

    return loginMetadata;
  }
}
