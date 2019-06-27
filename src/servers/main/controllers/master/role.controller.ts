import { Controller, Post, UseGuards, HttpCode, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { RoleService } from '../../services/master/role.service';
import { RoleFindAllResponseVm } from '../../models/role.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

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
  public async listRole(@Body() payload: BaseMetaPayloadVm) {

    return this.roleService.listData(payload);
  }
}
