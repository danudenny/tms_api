// #region import
import express = require('express');
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Response,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ScanoutWebReportService } from '../../services/pod/scanout-web-report.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebScanOutReportVm } from '../../../main/models/web-scan-out-response.vm';
// #endregion

@ApiUseTags('POD Web Scanout Report')
@Controller('web/pod/scanOut')
export class ScanoutWebReportController {
  constructor() {}

  @Post('excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return ScanoutWebReportService.storeExcelPayload(payloadBody);
  }

  @Get('branch/excel/export')
  public async exportExcelBranch(
    @Query() queryParams: WebScanOutReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScanoutWebReportService.generateScanOutDeliveryCSV(serverResponse, queryParams);
  }

  @Get('hubTransit/excel/export')
  public async exportExcelCombinePackage(
    @Query() queryParams: WebScanOutReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScanoutWebReportService.generateScanOutDeliveryCSV(serverResponse, queryParams, false, true);
  }
  @Get('hubSortir/excel/export')
  public async exportExcelBagSortir(
    @Query() queryParams: WebScanOutReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScanoutWebReportService.generateScanOutDeliveryCSV(serverResponse, queryParams, true);
  }
  @Get('transit/excel/export')
  public async exportExcelDeliveryTransit(
    @Query() queryParams: WebScanOutReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScanoutWebReportService.generateScanOutDeliveryTransitCSV(serverResponse, queryParams);
  }

  @Get('deliver/excel/export')
  public async exportExcelDeliveryDeliver(
    @Query() queryParams: WebScanOutReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScanoutWebReportService.generateScanOutDeliveryDeliverCSV(serverResponse, queryParams);
  }
}
