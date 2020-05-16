import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ScaninSmdService } from '../../services/integration/scanin-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanInSmdPayloadVm } from '../../models/scanin-smd.payload.vm';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('SCAN IN POD')
@Controller('branch')
export class ScanInController {
  constructor() {}

  @Post('scanIn/bag')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInBagSmd(@Req() request: any, @Body() payload: ScanInSmdPayloadVm) {
    return ScaninSmdService.scanInBag(payload);
  }

  @Post('scanIn/bagging')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInBaggingSmd(@Req() request: any, @Body() payload: ScanInSmdPayloadVm) {
    return ScaninSmdService.scanInBagging(payload);
  }

  @Post('scanIn/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScaninSmdService.findScanInList(payload);
  }
}
