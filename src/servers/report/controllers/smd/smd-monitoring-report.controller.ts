import { Body, Controller, Post, Req, UseGuards, Query, Get, Response} from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import express = require('express');
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { MonitoringPayloadVm } from '../../../smd/models/smd-monitoring-payload.vm';
import { SmdMonitoringReportService } from '../../services/smd/smd-monitoring-report.service';

@ApiUseTags('SMD Monitoring Report')
@Controller('monitoring')
export class SmdMonitoringReportController {
  constructor() {}

  @Post('smd/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return SmdMonitoringReportService.storeExcelPayload(payloadBody);
  }

  @Get('smd/export/excel')
  public async exportExcel(
    @Query() queryParams: MonitoringPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdMonitoringReportService.exportCSV(serverResponse, queryParams);
  }

  @Get('smd/export/csv')
  public async exportCsv(
    @Query() queryParams: MonitoringPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdMonitoringReportService.exportCSV(serverResponse, queryParams);
  }
}
