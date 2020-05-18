import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm } from '../../models/scanout-smd.payload.vm';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('SCAN OUT SMD')
@Controller('smd')
export class ScanOutController {
  constructor() {}

  @Post('scanOut/vehicle')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutVehicle(@Req() request: any, @Body() payload: ScanOutSmdVehiclePayloadVm) {
    return ScanoutSmdService.scanOutVehicle(payload);
  }

  @Post('scanOut/route')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutRoute(@Req() request: any, @Body() payload: ScanOutSmdRoutePayloadVm) {
    return ScanoutSmdService.scanOutRoute(payload);
  }

  // @Post('scanIn/do')
  // @Transactional()
  // @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  // public async scanInBaggingSmd(@Req() request: any, @Body() payload: ScanInSmdPayloadVm) {
  //   return ScaninSmdService.scanInDo(payload);
  // }

  // @Post('scanIn/list')
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // public async FindscanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
  //   return ScaninSmdService.findScanInList(payload);
  // }
}
