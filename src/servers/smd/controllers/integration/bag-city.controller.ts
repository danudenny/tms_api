import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Response, Get, Query } from '@nestjs/common';
import express = require('express');
import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BagCityService } from '../../services/integration/bag-city.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { BagCityResponseVm, ListBagCityResponseVm, ListDetailBagCityResponseVm, BagCityMoreResponseVm, BagCityDetailScanResponseVm, CreateBagCityResponseVm } from '../../models/bag-city-response.vm';
import { BagCityPayloadVm, BagCityExportPayloadVm, BagCityMorePayloadVm, BagCityDetailScanPayloadVm, BagCityCreateHeaderPayloadVm } from '../../models/bag-city-payload.vm';
import { PrintBagCityPayloadVm, PrintBagCityForPaperPayloadVm, BagCityExternalPrintPayloadVm, BagCityExternalPrintExecutePayloadVm } from '../../models/print-bag-city-payload.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';

@ApiUseTags('SMD Bag City')
@Controller('smd/bag-city')
export class BagCityController {
  constructor() {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ListBagCityResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async listBagCity(@Body() payload: BaseMetaPayloadVm) {
    return BagCityService.listBagCity(payload);
  }

  @Post('list/detail')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ListDetailBagCityResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async listDetailBagCity(@Body() payload: BaseMetaPayloadVm) {
    return BagCityService.listDetailBagCity(payload);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: BagCityResponseVm })
  @ApiBearerAuth()
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async createBagCity(@Body() payload: BagCityPayloadVm) {
    return BagCityService.createBagCity(payload);
  }

  @Post('create-header')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CreateBagCityResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async createBagCityHeader(@Body() payload: BagCityCreateHeaderPayloadVm) {
    return BagCityService.createBagCityHeader(payload);
  }

  @Post('create/manual-input')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: BagCityMoreResponseVm })
  @ApiBearerAuth()
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async createBagCityMore(@Body() payload: BagCityMorePayloadVm) {
    return BagCityService.createBagCityMore(payload);
  }

  @Get('print')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagCity(
    @Query() queryParams: PrintBagCityPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return BagCityService.printBagCity(serverResponse, queryParams);
  }

  @Get('print-from-jsreport')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagCityFromJsReport(
    @Query() queryParams: PrintBagCityPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return BagCityService.printBagCityFromJsReport(serverResponse, queryParams);
  }

  @Get('print-paper')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagCityForPaper(
    @Query() queryParams: PrintBagCityForPaperPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return BagCityService.printBagCityForPaper(serverResponse, queryParams);
  }

  @Post('print/store')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async storeBagCityExternalPrint(@Body() body: BagCityExternalPrintPayloadVm) {
    return BagCityService.storeBagCityExternalPrint(body);
  }

  @Get('print/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({disable: true})
  public async executeBagCityExternalPrint(
    @Query() params: BagCityExternalPrintExecutePayloadVm,
    @Response() response: express.Response,
  ) {
    return BagCityService.executeBagCityExternalPrint(response, params);
  }

  @Post('excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return BagCityService.storeExcelPayload(payloadBody);
  }

  @Get('export/excel')
  public async exportExcel(
    @Query() queryParams: BagCityExportPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return BagCityService.exportExcel(serverResponse, queryParams);
  }

  @Post('scan/detail')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: BagCityDetailScanResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async listDetailScanBagCity(@Body() payload: BagCityDetailScanPayloadVm) {
    return BagCityService.listDetailScanBagCity(payload);
  }
}
