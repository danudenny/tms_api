import { Body, Controller, Post, Get, Query, Response } from '@nestjs/common';
import express = require('express');

import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { SmdVendorReportService } from '../../services/smd/smd-vendor-report.service';
import { ScanOutVendorReportVm } from '../../../smd/models/scanout-smd-vendor.response.vm';

@ApiUseTags('SMD Vendor Report')
@Controller('smd/vendor')
export class SmdVendorReportController {
  constructor() {}

  @Post('excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return SmdVendorReportService.storeExcelPayload(payloadBody);
  }

  @Get('excel/export')
  public async exportExcelBranch(
    @Query() queryParams: ScanOutVendorReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdVendorReportService.generateVendorCSV(serverResponse, queryParams);
  }
}
