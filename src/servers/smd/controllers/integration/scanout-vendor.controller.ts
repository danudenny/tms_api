import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScanOutSmdVendorRoutePayloadVm, ScanOutSmdVendorItemPayloadVm, ScanOutSmdVendorEndPayloadVm } from '../../models/scanout-smd-vendor.payload.vm';
import { ScanoutSmdVendorService } from '../../services/integration/scanout-smd-vendor.service';

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

  @Post('scanOut/end')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutSeal(@Req() request: any, @Body() payload: ScanOutSmdVendorEndPayloadVm) {
    return ScanoutSmdVendorService.scanOutVendorEnd(payload);
  }
}
