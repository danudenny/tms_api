import { Body, Controller, Post, Req, UseGuards, Get, Query, Response, HttpCode, HttpStatus } from '@nestjs/common';
import { ScaninSmdService } from '../../services/integration/scanin-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanInSmdPayloadVm, ScanInSmdMorePayloadVm, ScaninDetailScanPayloadVm } from '../../models/scanin-smd.payload.vm';
import { ApiUseTags, ApiOkResponse, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ScanInSmdBagResponseVm, ScanInSmdBagMoreResponseVm, ScanInSmdBaggingResponseVm, ScaninDetailScanResponseVm } from '../../models/scanin-smd.response.vm';
import {ResponseSerializerOptions} from '../../../../shared/decorators/response-serializer-options.decorator';
import express = require('express');

@ApiUseTags('SCAN IN POD')
@Controller('branch')
export class ScanInController {
  constructor() {}

  @Post('scanIn/bag')
  @Transactional()
  @ApiOkResponse({ type: ScanInSmdBagResponseVm })
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInBagSmd(@Req() request: any, @Body() payload: ScanInSmdPayloadVm) {
    return ScaninSmdService.scanInBag(payload);
  }

  @Post('scanIn/bag/manual-input')
  @Transactional()
  @ApiOkResponse({ type: ScanInSmdBagMoreResponseVm })
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInBagMoreSmd(@Req() request: any, @Body() payload: ScanInSmdMorePayloadVm) {
    return ScaninSmdService.scanInBagMore(payload);
  }

  @Post('scanIn/do')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInBaggingSmd(@Req() request: any, @Body() payload: ScanInSmdPayloadVm) {
    return ScaninSmdService.scanInDo(payload);
  }

  @Post('scanIn/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScaninSmdService.findScanInList(payload);
  }

  @Post('scanInDetail/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindDetailscanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ScaninSmdService.findDetailScanInList(payload);
  }

  @Post('scanIn/scan/detail')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ScaninDetailScanResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async detailScaninScanned(@Body() payload: ScaninDetailScanPayloadVm) {
    return ScaninSmdService.detailScaninScanned(payload);
  }
}
