import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ScanOutSmdVendorRoutePayloadVm, ScanOutSmdVendorItemPayloadVm, ScanOutSmdVendorEndPayloadVm, ScanOutSmdVendorItemMorePayloadVm } from '../../models/scanout-smd-vendor.payload.vm';
import { ScanoutSmdVendorService } from '../../services/integration/scanout-smd-vendor.service';
import { ScanOutSmdVendorItemMoreResponseVm } from '../../models/scanout-smd-vendor.response.vm';

@ApiUseTags('SCAN OUT SMD')
@Controller('smd/vendor')
export class ScanOutVendorController {
  constructor() {}

  @Post('scanOut/route')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutVendorRoute(@Req() request: any, @Body() payload: ScanOutSmdVendorRoutePayloadVm) {
    return ScanoutSmdVendorService.scanOutVendorRoute(payload);
  }

  @Post('scanOut/item')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutVendorItem(@Req() request: any, @Body() payload: ScanOutSmdVendorItemPayloadVm) {
    return ScanoutSmdVendorService.scanOutVendorItem(payload);
  }

  @Post('scanOut/item/manual-input')
  @ApiOkResponse({ type: ScanOutSmdVendorItemMoreResponseVm })
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutVendorItemMore(@Req() request: any, @Body() payload: ScanOutSmdVendorItemMorePayloadVm) {
    return ScanoutSmdVendorService.scanOutVendorItemMore(payload);
  }

  @Post('scanOut/end')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutSeal(@Req() request: any, @Body() payload: ScanOutSmdVendorEndPayloadVm) {
    return ScanoutSmdVendorService.scanOutVendorEnd(payload);
  }

  @Delete('scanOut/deleted/:id')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async deleteAttachment(@Param('id') attachmentId: number) {
    await ScanoutSmdVendorService.deleteSmdVendor(attachmentId);

    return {
      message: 'SMD ID: ' + attachmentId + ' Deleted' ,
      statusCode: 200,
    };
  }
}
