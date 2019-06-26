import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { RoleService } from '../../services/master/role.service';
import { RoleFindAllResponseVm, RolePayloadVm } from '../../models/role.vm';

@ApiUseTags('Master Data')
@Controller('master/role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
  ) { }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: RoleFindAllResponseVm })
  public async listRole(@Body() payload: RolePayloadVm) {

    return this.roleService.listData(payload);
  }
}
