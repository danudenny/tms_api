import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
// import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdSealPayloadVm, ScanOutSmdHandoverPayloadVm, ScanOutSmdDetailPayloadVm } from '../../models/scanout-smd.payload.vm';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScanoutSmdListService } from '../../services/integration/scanout-smd-list.service';

@ApiUseTags('SCAN OUT List SMD')
@Controller('smd')
export class ScanOutListController {
  constructor() {}

  @Post('scanOut/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdListService.findScanOutList(payload);
  }

  @Post('scanOut/history')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutHistory(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdListService.findScanOutHistory(payload);
  }

  @Post('scanOut/detailBag')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanOutDetail(@Req() request: any, @Body() payload: ScanOutSmdDetailPayloadVm) {
    return ScanoutSmdListService.findScanOutDetail(payload);
  }

  @Post('scanOut/detailBagging')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanOutDetailBagging(@Req() request: any, @Body() payload: ScanOutSmdDetailPayloadVm) {
    return ScanoutSmdListService.findScanOutDetailBagging(payload);
  }

}
