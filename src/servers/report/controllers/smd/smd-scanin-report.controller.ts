import { Body, Controller, Post, Req, UseGuards, Delete, Param, Query, Get, Response } from '@nestjs/common';
import express = require('express');

import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { SmdScaninReportService } from '../../services/smd/smd-scanin-report.service';
import { ScanOutSmdScanInReportVm } from '../../../smd/models/scanin-smd.response.vm';

@ApiUseTags('SMD Scan In Report')
@Controller('smd')
export class SmdScaninReportController {
  constructor() {}

  @Post('scanIn/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return SmdScaninReportService.storeExcelPayload(payloadBody);
  }

  @Get('scanIn/excel/export')
  public async exportExcelBranch(
    @Query() queryParams: ScanOutSmdScanInReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdScaninReportService.generateScanInCSV(serverResponse, queryParams);
  }
}
