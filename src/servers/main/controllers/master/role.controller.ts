import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RoleFindAllResponseVm } from '../../models/role-response.vm';
import { RoleService } from '../../services/master/role.service';

@ApiUseTags('Master Data')
@Controller('master/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: RoleFindAllResponseVm })
  public async findAllList(@Body() payload: BaseMetaPayloadVm) {
    return this.roleService.findAllByRequest(payload);
  }
}
