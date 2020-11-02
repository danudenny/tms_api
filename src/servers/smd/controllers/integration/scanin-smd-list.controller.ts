import { Body, Controller, Post, Req, UseGuards, Delete, Param, Query, Get, Response } from '@nestjs/common';
import express = require('express');

import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScaninSmdListService } from '../../services/integration/scanin-smd-list.service';
import { ScanInSmdDetailPayloadVm } from '../../models/scanin-smd-list.payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ScaninSmdReportService } from '../../services/integration/scanin-smd-report.service';
import { ScanOutSmdScanInReportVm } from '../../models/scanin-smd.response.vm';

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

  @Post('scanIn/detailBagRepresentative')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async FindscanInDetailBagRepresentative(@Req() request: any, @Body() payload: ScanInSmdDetailPayloadVm) {
    return ScaninSmdListService.findScanInDetailBagRepresentative(payload);
  }

  @Post('scanIn/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return ScaninSmdReportService.storeExcelPayload(payloadBody);
  }

  @Get('scanIn/excel/export')
  public async exportExcelBranch(
    @Query() queryParams: ScanOutSmdScanInReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScaninSmdReportService.generateScanInCSV(serverResponse, queryParams);
  }
}
