import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
// import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdSealPayloadVm, ScanOutSmdHandoverPayloadVm, ScanOutSmdDetailPayloadVm, ScanOutSmdDetailMorePayloadVm, ScanOutSmdDetailRepresentativePayloadVm, ScanOutSmdImagePayloadVm } from '../../models/scanout-smd.payload.vm';
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

  @Post('scanOut/detailRepresentative')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanOutDetailRepresentative(@Req() request: any, @Body() payload: ScanOutSmdDetailRepresentativePayloadVm) {
    return ScanoutSmdListService.findScanOutDetailRepresentative(payload);
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

  @Post('scanOut/detailBagRepresentative')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanOutDetailBagRepresentative(@Req() request: any, @Body() payload: ScanOutSmdDetailPayloadVm) {
    return ScanoutSmdListService.findScanOutDetailBagRepresentative(payload);
  }

  @Post('scanOut/detailBag/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutDetailMore(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdListService.findScanOutDetailMore(payload);
  }

  @Post('scanOut/detailBagging/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutDetailBaggingMore(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdListService.findScanOutDetailBaggingMore(payload);
  }

  @Post('scanOut/detailBagRepresentative/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutDetailBagRepresentativeMore(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdListService.findScanOutDetailBagRepresentativeMore(payload);
  }

  @Post('scanOut/image')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutImage(@Req() request: any, @Body() payload: ScanOutSmdImagePayloadVm) {
    return ScanoutSmdListService.findScanOutImage(payload);
  }

}
