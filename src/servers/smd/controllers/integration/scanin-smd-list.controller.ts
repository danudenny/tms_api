import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
// import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdSealPayloadVm, ScanOutSmdHandoverPayloadVm, ScanOutSmdDetailPayloadVm, ScanOutSmdDetailMorePayloadVm } from '../../models/scanout-smd.payload.vm';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScaninSmdListService } from '../../services/integration/scanin-smd-list.service';

@ApiUseTags('SCAN IN List SMD')
@Controller('smd')
export class ScanInSmdListController {
  constructor() {}

  @Post('scanIn/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScaninSmdListService.findScanInList(payload);
  }

}
