import { Body, Controller, Post, Query, Response, Get } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import express = require('express');
import { StoreExcelScanOutPayloadVm } from '../../../smd/models/scanout-smd.payload.vm';
import { SmdScanoutReportService } from '../../services/smd/smd-scanout-report-service';

@ApiUseTags('Smd Scan Out Report')
@Controller('smd')
export class SmdScanoutReportController {
  constructor() {}

  @Post('scanOut/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return SmdScanoutReportService.storeExcelPayload(payloadBody);
  }

  @Get('scanOut/export/excel')
  public async exportExcel(
    @Query() queryParams: StoreExcelScanOutPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdScanoutReportService.exportCSV(serverResponse, queryParams);
  }

  @Post('scanOut/vendor/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcelVendor(@Body() payloadBody: BaseMetaPayloadVm) {
    return SmdScanoutReportService.storeExcelVendorPayload(payloadBody);
  }

  @Get('scanOut/vendor/export/excel')
  public async exportExcelVendor(
    @Query() queryParams: StoreExcelScanOutPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdScanoutReportService.exportVendorCSV(serverResponse, queryParams);
  }
}
