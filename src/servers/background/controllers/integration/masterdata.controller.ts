import { Body, Controller, Post, Get, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';

import { MasterDataService } from '../../services/integration/masterdata.service';
import { MappingRolePayloadVm } from '../../models/mapping-role.payload.vm';
import { MappingRoleUserPayloadVm } from '../../models/mapping-role-user.payload.vm';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthApiKeyGuard } from '../../guards/auth-api-key.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Master Data')
@Controller('integration/masterdata')
export class MasterDataController {
  constructor() {}

  @Post('mapping/role')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthApiKeyGuard)
  public async mappingRole(@Body() payload: MappingRolePayloadVm) {
    return MasterDataService.mappingRole(payload);
  }

  @Post('mapping/role-user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthApiKeyGuard)
  public async mappingRoleUser(@Body() payload: MappingRoleUserPayloadVm) {
    return MasterDataService.mappingRoleUser(payload);
  }

  @Get('role-tms')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthApiKeyGuard)
  public async roleTms(@Body() payload: BaseMetaPayloadVm) {
    return MasterDataService.roleTms(payload);
  }

  @Get('sync/role-tms')
  @HttpCode(HttpStatus.OK)
  public async syncRoleTms(@Body() payload: any) {
    return MasterDataService.syncRoleTms(payload);
  }
}
