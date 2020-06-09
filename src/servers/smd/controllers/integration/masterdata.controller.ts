import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ScaninSmdService } from '../../services/integration/scanin-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import {MasterDataService} from '../../services/integration/masterdata.service';
import {MappingDoSmdResponseVm} from '../../models/mapping-do-smd.response.vm';

@ApiUseTags('MASTER DATA')
@Controller('smd/masterdata')
export class MasterDataController {
  constructor() {}

  @Post('doSmd/list')
  @Transactional()
  @ApiOkResponse({ type: MappingDoSmdResponseVm })
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async mappingDoSMD(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return MasterDataService.mappingDoSMD(payload);
  }
}
