import { Body, Controller, Post, UseGuards, Get, Query, Response } from '@nestjs/common';
import express = require('express');
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { HubMonitoringExcelStoreResponseVm } from '../../models/hub-monitoring-report.response.vm';
import { HubMonitoringReportService } from '../../services/web/hub-transit/hub-monitoring-report.service';
import { HubMonitoringExcelExecutePayloadVm } from '../../models/hub-monitoring-report.payload.vm';

@ApiUseTags('Hub Delivery')
@Controller('pod/hub')
export class WebHubReportController {
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
  public async exportExcelMonitoringKorwil(
    @Query() queryParams: HubMonitoringExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return HubMonitoringReportService.generateHubMonitoringCSV(serverResponse, queryParams);
  }
}
