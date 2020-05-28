import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdSealPayloadVm, ScanOutSmdHandoverPayloadVm, ScanOutSmdDetailPayloadVm } from '../../models/scanout-smd.payload.vm';
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

  @Post('scanOut/item')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutItem(@Req() request: any, @Body() payload: ScanOutSmdItemPayloadVm) {
    return ScanoutSmdService.scanOutItem(payload);
  }

  @Post('scanOut/seal')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutSeal(@Req() request: any, @Body() payload: ScanOutSmdSealPayloadVm) {
    return ScanoutSmdService.scanOutSeal(payload);
  }

  @Delete('scanOut/deleted/:id')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async deleteAttachment(@Param('id') attachmentId: number) {
    await ScanoutSmdService.deleteSmd(attachmentId);

    return {
      message: 'SMD ID: ' + attachmentId + ' Deleted' ,
      statusCode: 200,
    };
  }

  @Post('scanOut/handover')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutHandover(@Req() request: any, @Body() payload: ScanOutSmdHandoverPayloadVm) {
    return ScanoutSmdService.scanOutHandover(payload);
  }

}
