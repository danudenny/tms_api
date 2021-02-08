import { Body, Controller, Get, Post, Query, Response } from '@nestjs/common';
import express = require('express');

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { HubDeliveryInExcelExecuteVm } from '../../../main/models/web-scanin.vm';
import { ScaninWebDeliveryReportService } from '../../services/pod/scanin-web-delivery-report.service';

@ApiUseTags('POD Web Scanin Report')
@Controller('web/pod/scanIn')
export class ScaninWebDeliveryReportController {
  constructor() {}

  @Post('excel/hub-store')
  @ApiBearerAuth()
  @ApiOkResponse({ type: HubDeliveryInExcelExecuteVm })
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: any) {
    return ScaninWebDeliveryReportService.storeHubDeliveryInPayload(payloadBody);
  }

  @Get('excel/hub-execute')
  public async exportExcelMonitoringKorwil(
    @Query() queryParams: HubDeliveryInExcelExecuteVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScaninWebDeliveryReportService.generateHubDeliveryInCSV(serverResponse, queryParams);
  }
}
