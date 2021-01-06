import { Body, Controller, Post, UseGuards, Get, Query, Response } from '@nestjs/common';
import express = require('express');
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import {HubMonitoringExcelStoreResponseVm} from '../../../main/models/hub-monitoring-report.response.vm';
import {HubMonitoringReportService} from '../../services/pod/hub-monitoring-report.service';
import {HubMonitoringExcelExecutePayloadVm} from '../../../main/models/hub-monitoring-report.payload.vm';

@ApiUseTags('Hub Monitoring Report')
@Controller('pod/hub')
export class HubMonitoringReportController {
  constructor() {}

  @Post('monitoring/bag-store')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: HubMonitoringExcelStoreResponseVm })
  @ResponseSerializerOptions({ disable: true })
  public async storeHubMonitoringPayload(@Body() payloadBody: BaseMetaPayloadVm) {
    return HubMonitoringReportService.storeHubMonitoringPayload(payloadBody);
  }

  @Get('monitoring/bag-execute')
  public async generateHubMonitoringCSV(
    @Query() queryParams: HubMonitoringExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return HubMonitoringReportService.generateHubMonitoringCSV(serverResponse, queryParams);
  }

  @Get('monitoring/sortir-execute')
  public async generateHubMonitoringSortirCSV(
    @Query() queryParams: HubMonitoringExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return HubMonitoringReportService.generateHubMonitoringSortirCSV(serverResponse, queryParams);
  }
}
