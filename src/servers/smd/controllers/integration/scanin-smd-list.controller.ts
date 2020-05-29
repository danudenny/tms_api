import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScaninSmdListService } from '../../services/integration/scanin-smd-list.service';
import { ScanInSmdDetailPayloadVm } from '../../models/scanin-smd-list.payload.vm';

@ApiUseTags('SCAN IN List SMD')
@Controller('smd')
export class ScanInSmdListController {
  constructor() {}

  @Post('scanIn/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScaninSmdListService.findScanInList(payload);
  }

  @Post('scanIn/detailBag')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanInDetail(@Req() request: any, @Body() payload: ScanInSmdDetailPayloadVm) {
    return ScaninSmdListService.findScanInDetail(payload);
  }

  @Post('scanIn/detailBagging')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanInDetailBagging(@Req() request: any, @Body() payload: ScanInSmdDetailPayloadVm) {
    return ScaninSmdListService.findScanInDetailBagging(payload);
  }

}
