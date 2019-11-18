import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { RolePermissionListPayloadVm } from '../../models/role-permission-list-payload.vm';
import { RolePermissionListResponseVm } from '../../models/role-permission-list-response.vm';
import { RolePermissionUpdatePayloadVm } from '../../models/role-permission-update-payload.vm';
import { RolePermissionUpdateResponseVm } from '../../models/role-permission-update-response.vm';
import { RolePermissionService } from '../../services/master/role-permission.service';

@ApiUseTags('Role Permission')
@Controller('master/rolePermission')
export class RolePermissionController {
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: RolePermissionListResponseVm })
  async rolePermissionList(@Body() payload: RolePermissionListPayloadVm) {
    return RolePermissionService.rolePermissionListByRequest(payload);
  }

  @Post('edit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: RolePermissionUpdateResponseVm })
  async rolePermissionUpdate(@Body() payload: RolePermissionUpdatePayloadVm) {
    return RolePermissionService.rolePermissionUpdateByRequest(payload);
  }
}
