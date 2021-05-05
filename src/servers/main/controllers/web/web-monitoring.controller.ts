import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Query, Response } from '@nestjs/common';
import express = require('express');
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BagMonitoringPayloadVm } from '../../models/bag-monitoring-payload.vm';
import { BagMonitoringResponseVm } from '../../models/bag-monitoring-response.vm';
import { WebMonitoringService } from '../../services/web/web-monitoring.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebMonitoringCoordinatorService } from '../../services/web/web-monitoring-coordinator.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebMonitoringCoordinatorResponse, WebMonitoringCoordinatorTaskResponse, WebMonitoringCoordinatorPhotoResponse, WebMonitoringCoordinatorListResponse, WebMonitoringCoordinatorDetailResponse, CreateTransactionCoordinatorResponse, WebMonitoringCoordinatorTaskReportResponse, WebMonitoringCoordinatorBranchResponse, MonitoringCoordinatorExcelExecuteResponseVm } from '../../models/web-monitoring-coordinator.response.vm';
import { WebMonitoringCoordinatorTaskPayload, WebMonitoringCoordinatorPhotoPayload, WebMonitoringCoordinatorDetailPayload, MonitoringCoordinatorExcelExecutePayloadVm } from '../../models/web-monitoring-coordinator-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { WebMonitoringCoordinatorReportService } from '../../services/web/web-monitoring-coordinator-report.service';

@ApiUseTags('Web Monitoring')
@Controller('web/monitoring')
export class WebMonitoringController {
  @Post('bagIn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: BagMonitoringResponseVm })
  public async troubledList(@Body() payload: BagMonitoringPayloadVm) {
    return WebMonitoringService.findAllByRequest(payload);
  }

  @Post('coordinator/branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorResponse })
  public async monitoringCoordinatorList(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListAllBranch(payload);
  }

  @Post('coordinator-hrd/branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorResponse })
  public async monitoringCoordinatorHrdList(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListHrdAllBranch(payload);
  }

  @Post('coordinator/branch/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorBranchResponse })
  public async monitoringBranchCoordinatorList(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListBranchCoordinator(payload);
  }

  @Post('coordinator-hrd/branch/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorBranchResponse })
  public async monitoringHrdBranchCoordinatorList(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListHrdBranchCoordinator(payload);
  }

  @Post('coordinator')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorListResponse })
  public async monitoringCoordinator(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListCoordinator(payload);
  }

  @Post('coordinator-hrd')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorListResponse })
  public async monitoringCoordinatorHrd(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListHrdCoordinator(payload);
  }

  @Post('coordinator/task')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorTaskResponse })
  public async monitoringCoordinatorListTask(@Body() payload: WebMonitoringCoordinatorTaskPayload) {
    return WebMonitoringCoordinatorService.listTask(payload);
  }

  @Post('coordinator/taskReport')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorTaskReportResponse })
  public async monitoringCoordinatorTaskReport(@Body() payload: WebMonitoringCoordinatorTaskPayload) {
    return WebMonitoringCoordinatorService.taskReport(payload);
  }

  @Post('coordinator/task/photo')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorPhotoResponse })
  public async monitoringCoordinatorTaskPhoto(@Body() payload: WebMonitoringCoordinatorPhotoPayload) {
    return WebMonitoringCoordinatorService.taskPhoto(payload);
  }

  @Post('coordinator/detail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorDetailResponse })
  public async monitoringCoordinatorDetail(@Body() payload: WebMonitoringCoordinatorDetailPayload) {
    return WebMonitoringCoordinatorService.detailCoordinator(payload);
  }

  @Get('createTransaction/korwil')
  @ApiOkResponse({ type: CreateTransactionCoordinatorResponse })
  public async createTransaction() {
    return WebMonitoringCoordinatorService.createCoordinatorTrans();
  }

  @Post('coordinator/excel/store')
  @ApiBearerAuth()
  @ApiOkResponse({ type: MonitoringCoordinatorExcelExecuteResponseVm })
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: any) {
    return WebMonitoringCoordinatorReportService.storeMonitoringPayload(payloadBody);
  }

  @Get('coordinator/excel/korwil-execute')
  public async exportExcelMonitoringKorwil(
    @Query() queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return WebMonitoringCoordinatorReportService.generateMonitoringKorwilCSV(serverResponse, queryParams);
  }

  @Get('coordinator/excel/branch-execute')
  public async exportExcelMonitoringBranch(
    @Query() queryParams: MonitoringCoordinatorExcelExecutePayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return WebMonitoringCoordinatorReportService.generateMonitoringBranchCSV(serverResponse, queryParams);
  }
}
