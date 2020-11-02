import { Body, Controller, Post, Req, UseGuards, Delete, Param, Get, Query, Response } from '@nestjs/common';
import express = require('express');

import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiOkResponse, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScanOutSmdVendorListResponseVm, ScanOutSmdDetailVendorResponseVm, ScanOutSmdDetailBaggingVendorResponseVm, ScanOutSmdDetailBagRepresentativeVendorResponseVm, ScanOutVendorReportVm } from '../../models/scanout-smd-vendor.response.vm';
import {ScanoutSmdVendorListService} from '../../services/integration/scanout-smd-vendor-list.service';
import {ScanOutSmdDetailVendorPayloadVm} from '../../models/scanout-smd-vendor.payload.vm';
import {ResponseSerializerOptions} from '../../../../shared/decorators/response-serializer-options.decorator';
import {ScanoutSmdVendorReportService} from '../../services/integration/scanout-smd-vendor-report.service';

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

  @Post('scanOut/detailBag/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutDetailMore(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdVendorListService.findScanOutDetailMore(payload);
  }

  @Post('scanOut/detailBagging/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutDetailBaggingMore(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdVendorListService.findScanOutDetailBaggingMore(payload);
  }

  @Post('scanOut/detailBagRepresentative/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutDetailBagRepresentativeMore(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdVendorListService.findScanOutDetailBagRepresentativeMore(payload);
  }

  @Post('scanOut/history')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutHistory(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScanoutSmdVendorListService.findScanOutVendorHistory(payload);
  }

  @Post('excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return ScanoutSmdVendorReportService.storeExcelPayload(payloadBody);
  }

  @Get('excel/export')
  public async exportExcelBranch(
    @Query() queryParams: ScanOutVendorReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScanoutSmdVendorReportService.generateVendorCSV(serverResponse, queryParams);
  }
}
