import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdSealPayloadVm, ScanOutSmdHandoverPayloadVm, ScanOutSmdDetailPayloadVm, ScanOutSmdAssignItemPayloadVm, ScanOutSmdEditPayloadVm, ScanOutSmdEditDetailPayloadVm, ScanOutSmdItemMorePayloadVm } from '../../models/scanout-smd.payload.vm';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import {ScanOutSmdItemMoreResponseVm} from '../../models/scanout-smd.response.vm';
import { ScanoutSmdCityService } from '../../services/integration/scanout-smd-city.service';
import { ScanOutSmdCityItemPayloadVm, ScanOutSmdCitySealPayloadVm, ScanOutSmdCityVehiclePayloadVm } from '../../models/scanout-smd-city.payload.vm';

@ApiUseTags('SCAN OUT SMD CITY')
@Controller('smd')
export class ScanOutController {
  constructor() {}

  @Post('scanOut/city/vehicle')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutCityVehicle(@Req() request: any, @Body() payload: ScanOutSmdCityVehiclePayloadVm) {
    return ScanoutSmdCityService.scanOutCityVehicle(payload);
  }

  @Post('scanOut/city/item')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutCityItem(@Req() request: any, @Body() payload: ScanOutSmdCityItemPayloadVm) {
    return ScanoutSmdCityService.scanItemCitySMD(payload);
  }

  // @Post('scanOut/item/manual-input')
  // @Transactional()
  // @ApiOkResponse({ type: ScanOutSmdItemMoreResponseVm })
  // @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  // public async scanOutItemMore(@Req() request: any, @Body() payload: ScanOutSmdItemMorePayloadVm) {
  //   return ScanoutSmdService.scanOutItemMore(payload);
  // }

  @Post('scanOut/city/seal')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutCitySeal(@Req() request: any, @Body() payload: ScanOutSmdCitySealPayloadVm) {
    return ScanoutSmdCityService.scanOutSeal(payload);
  }

  // @Delete('scanOut/deleted/:id')
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // public async deleteAttachment(@Param('id') attachmentId: number) {
  //   await ScanoutSmdService.deleteSmd(attachmentId);

  //   return {
  //     message: 'SMD ID: ' + attachmentId + ' Deleted' ,
  //     statusCode: 200,
  //   };
  // }

  // @Post('scanOut/handover')
  // @Transactional()
  // @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  // public async scanOutHandover(@Req() request: any, @Body() payload: ScanOutSmdHandoverPayloadVm) {
  //   return ScanoutSmdService.scanOutHandover(payload);
  // }

  // @Post('scanOut/reassign/item')
  // @Transactional()
  // @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  // public async scanOutReassign(@Req() request: any, @Body() payload: ScanOutSmdAssignItemPayloadVm) {
  //   return ScanoutSmdService.scanOutReassignItem(payload);
  // }

  // @Post('scanOut/changeVehicle')
  // @Transactional()
  // @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  // public async scanOutChangeVehicle(@Req() request: any, @Body() payload: ScanOutSmdHandoverPayloadVm) {
  //   return ScanoutSmdService.scanOutChangeVehicle(payload);
  // }

  // @Post('scanOut/edit')
  // @Transactional()
  // @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  // public async scanOutEdit(@Req() request: any, @Body() payload: ScanOutSmdEditPayloadVm) {
  //   return ScanoutSmdService.scanOutEdit(payload);
  // }

  // @Post('scanOut/editDetail')
  // @Transactional()
  // @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  // public async scanOutEditDetail(@Req() request: any, @Body() payload: ScanOutSmdEditDetailPayloadVm) {
  //   return ScanoutSmdService.scanOutEditDetail(payload);
  // }
}
