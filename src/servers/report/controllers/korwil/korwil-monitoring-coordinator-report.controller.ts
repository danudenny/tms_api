import { Body, Controller, Post, Get, Query, Response, HttpCode, HttpStatus } from '@nestjs/common';
import express = require('express');
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { MonitoringCoordinatorExcelExecuteResponseVm, WebMonitoringCoordinatorTaskReportResponse } from '../../../main/models/web-monitoring-coordinator.response.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { MonitoringCoordinatorExcelExecutePayloadVm, WebMonitoringCoordinatorTaskPayload } from '../../../main/models/web-monitoring-coordinator-payload.vm';
import { KorwilMonitoringCoordinatorReportService } from '../../services/korwil/korwil-monitoring-coordinator-report.service';

@ApiUseTags('Korwil Monitoring Coordinator Report')
@Controller('web/monitoring')
export class KorwilMonitoringCoordinatorReportController {
  @Post('coordinator/excel/store')
  @ApiBearerAuth()
  @ApiOkResponse({ type: MonitoringCoordinatorExcelExecuteResponseVm })
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: any) {
    return KorwilMonitoringCoordinatorReportService.storeMonitoringPayload(payloadBody);
  }

  @Post('coordinator-hrd/excel/store')
  @ApiBearerAuth()
  @ApiOkResponse({ type: MonitoringCoordinatorExcelExecuteResponseVm })
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcelHrd(@Body() payloadBody: any) {
    return KorwilMonitoringCoordinatorReportService.storeMonitoringHrdPayload(payloadBody);
  }

  @Get('coordinator/excel/korwil-execute')
  public async exportExcelMonitoringKorwil(
    @Query() queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return KorwilMonitoringCoordinatorReportService.generateMonitoringKorwilCSV(serverResponse, queryParams);
  }

  @Get('coordinator-hrd/excel/korwil-execute')
  public async exportExcelMonitoringKorwilHrd(
    @Query() queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return KorwilMonitoringCoordinatorReportService.generateMonitoringKorwilHrdCSV(serverResponse, queryParams);
  }

  @Get('coordinator/excel/branch-execute')
  public async exportExcelMonitoringBranch(
    @Query() queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return KorwilMonitoringCoordinatorReportService.generateMonitoringBranchCSV(serverResponse, queryParams);
  }

  @Get('coordinator-hrd/excel/branch-execute')
  public async exportExcelMonitoringHrdBranch(
    @Query() queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return KorwilMonitoringCoordinatorReportService.generateMonitoringBranchHrdCSV(serverResponse, queryParams);
  }

  @Get('coordinator/taskReport')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebMonitoringCoordinatorTaskReportResponse })
  public async monitoringCoordinatorTaskReport(
    @Query() payload: WebMonitoringCoordinatorTaskPayload,
    @Response() serverResponse: express.Response,
  ) {
    return KorwilMonitoringCoordinatorReportService.generateMonitoringBranchPDF(payload, serverResponse);
  }
}
