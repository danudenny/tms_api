import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScanOutSmdVendorListResponseVm } from '../../models/scanout-smd-vendor.response.vm';
import {ScanoutSmdVendorListService} from '../../services/integration/scanout-smd-vendor-list.service';

@ApiUseTags('SCAN OUT SMD LIST')
@Controller('smd/vendor')
export class ScanOutVendorListController {
  constructor() {}

  @Post('scanOut/list')
  @Transactional()
  @ApiOkResponse({ type: ScanOutSmdVendorListResponseVm })
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutVendorList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdVendorListService.scanOutVendorList(payload);
  }
}
