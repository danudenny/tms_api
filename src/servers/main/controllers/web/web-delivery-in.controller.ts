import { Body, Controller, HttpCode, HttpStatus, Get, Post, UseGuards, Query, Response } from '@nestjs/common';
import express = require('express');

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebScanInBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInListResponseVm, WebScanInBagListResponseVm, WebScanInBranchListResponseVm, WebScanInHubSortListResponseVm, WebScanInBranchListBagResponseVm, WebScanInBranchListAwbResponseVm, WebScanInHubListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInBranchResponseVm, WebScanInValidateBranchVm, WebScanInBagBranchVm, WebScanInBranchLoadResponseVm, HubDeliveryInExcelExecuteVm } from '../../models/web-scanin.vm';
import { WebDeliveryInService } from '../../services/web/web-delivery-in.service';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { LastMileDeliveryInService } from '../../services/web/last-mile/last-mile-delivery-in.service';
import { WebDeliveryInReportService } from '../../services/web/web-delivery-in-report.service';

@ApiUseTags('Web Delivery In')
@Controller('web/pod/scanIn')
export class WebDeliveryInController {
  constructor(
    private readonly webDeliveryService: WebDeliveryInService,
  ) {}

  // NOTE: not used now
  // @Post('awb')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ApiOkResponse({ type: WebScanInAwbResponseVm })
  // @Transactional()
  // public async scanIn(@Body() payload: WebScanInVm) {
  //   return this.webDeliveryService.scanInAwb(payload);
  // }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllDeliveryList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllAwbByRequest(payload);
  }

  @Post('bagList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBagListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBagList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllBagByRequest(payload);
  }

  @Post('branchList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBranchListResponseVm })
  public async findAllBranchList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllBranchInByRequest(payload);
  }

  @Post('branchList/count')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBranchListResponseVm })
  public async findAllBranchListCount(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllBranchInByRequestCount(payload);
  }

  @Post('branchListBag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBranchListBagResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBranchListBag(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllBranchListBag(payload);
  }

  @Post('branchListBagTagSeal')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBranchListBagResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBranchListBagTagSeal(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllBranchListBagTagSeal(payload);
  }

  @Post('branchListAwb')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBranchListAwbResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBranchListAwb(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllBranchListAwb(payload);
  }

  @Post('hubSortList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllHubSortList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllHubSortInByRequest(payload);
  }

  @Post('hubSortList/count')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllHubSortListCount(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllHubSortInByRequestCount(payload);
  }

  @Post('hubSortListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllHubSortListDetail(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllHubSortDetailByRequest(payload);
  }

  @Post('bagListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBagListDetail(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.findAllBagDetailByRequest(payload);
  }

  @Post('bag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBagResponseVm })
  public async scanInBag(@Body() payload: WebScanInBagVm) {
    return this.webDeliveryService.scanInBag(payload);
  }

  // TODO: to be removed
  @Post('dropoff')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBagResponseVm })
  public async scanInBagHub(@Body() payload: WebScanInBagVm) {
    return this.webDeliveryService.scanInBagHub(payload);
  }

  // NOTE: endpoint scan in branch, handle bag number or awb number
  @Post('branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBranchResponseVm })
  public async scanInBranch(@Body() payload: WebScanInBagBranchVm) {
    return LastMileDeliveryInService.scanInBranch(payload);
  }

  @Post('validateBranch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  // @ApiOkResponse({ type: WebScanInBranchResponseVm })
  public async validateBranch(@Body() payload: WebScanInValidateBranchVm) {
    return this.webDeliveryService.scanInValidateBranch(payload);
  }

  @Post('loadBranch')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: WebScanInBranchLoadResponseVm })
  public async loadBranchPackage() {
    return this.webDeliveryService.loadBranchPackage();
  }

  // TODO: to be removed
  @Post('dropOffList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  public async loadDropOffHubList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadDropOffList(payload);
  }
  // TODO: to be removed
  @Post('dropOffListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async loadDropOffHubListDetail(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadDropOffListDetail(payload);
  }

  @Post('sortationHubList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  public async loadSortationHubList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadSortationList(payload);
  }

  @Post('sortationHubListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async loadSortationHubListDetail(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadSortationListDetail(payload);
  }

  @Post('hubList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInHubListResponseVm })
  public async scanInHubList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.hubScanInList(payload);
  }

  @Post('excel/hub-store')
  @ApiBearerAuth()
  @ApiOkResponse({ type: HubDeliveryInExcelExecuteVm })
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: any) {
    return WebDeliveryInReportService.storeHubDeliveryInPayload(payloadBody);
  }

  @Get('excel/hub-execute')
  public async exportExcelMonitoringKorwil(
    @Query() queryParams: HubDeliveryInExcelExecuteVm,
    @Response() serverResponse: express.Response,
  ) {
    return WebDeliveryInReportService.generateHubDeliveryInCSV(serverResponse, queryParams);
  }
}
