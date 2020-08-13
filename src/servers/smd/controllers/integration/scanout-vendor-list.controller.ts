import { Body, Controller, Post, Req, UseGuards, Delete, Param } from '@nestjs/common';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScanOutSmdVendorListResponseVm, ScanOutSmdDetailVendorResponseVm, ScanOutSmdDetailBaggingVendorResponseVm, ScanOutSmdDetailBagRepresentativeVendorResponseVm } from '../../models/scanout-smd-vendor.response.vm';
import {ScanoutSmdVendorListService} from '../../services/integration/scanout-smd-vendor-list.service';
import {ScanOutSmdDetailVendorPayloadVm} from '../../models/scanout-smd-vendor.payload.vm';

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

  @Post('scanOut/detailBag')
  @ApiOkResponse({ type: ScanOutSmdDetailVendorResponseVm })
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanOutDetail(@Req() request: any, @Body() payload: ScanOutSmdDetailVendorPayloadVm) {
    return ScanoutSmdVendorListService.findScanOutDetail(payload);
  }

  @Post('scanOut/detailBagging')
  @Transactional()
  @ApiOkResponse({ type: ScanOutSmdDetailBaggingVendorResponseVm })
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanOutDetailBagging(@Req() request: any, @Body() payload: ScanOutSmdDetailVendorPayloadVm) {
    return ScanoutSmdVendorListService.findScanOutDetailBagging(payload);
  }

  @Post('scanOut/detailBagRepresentative')
  @Transactional()
  @ApiOkResponse({ type: ScanOutSmdDetailBagRepresentativeVendorResponseVm })
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanOutDetailBagRepresentative(@Req() request: any, @Body() payload: ScanOutSmdDetailVendorPayloadVm) {
    return ScanoutSmdVendorListService.findScanOutDetailBagRepresentative(payload);
  }
}
