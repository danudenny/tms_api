import { Controller, Query, Response, Get, Body, Post, UseGuards } from '@nestjs/common';
import express = require('express');
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import {ResponseSerializerOptions} from '../../../../shared/decorators/response-serializer-options.decorator';
import { SmdPrintService } from '../../services/integration/smd-print.service';
import { PrintSmdPayloadVm, PrintBaggingPaperPayloadVm, PrintReceivedBagPaperPayloadVm, PrintScaninVm} from '../../models/print-smd-payload.vm';
import { PrintDoSmdPayloadQueryVm } from '../../models/print-do-smd-payload.vm';
import { PrintBaggingVm } from '../../models/print-bagging.payload';
import {AuthenticatedGuard} from '../../../../shared/guards/authenticated.guard';
import {PermissionTokenGuard} from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('SMD printing')
@Controller('smd/print')
export class SmdPrintController {
  constructor() {}
  @Get('bagging')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagging(
    @Query() queryParams: PrintSmdPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdPrintService.printBagging(serverResponse, queryParams);
  }

  @Post('bagging/store')
  @ApiBearerAuth()
  public async storePrintBagging(@Body() payloadBody: PrintBaggingVm) {
    return SmdPrintService.storePrintBagging(payloadBody);
  }

  @Get('bagging/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async executePrintBagging(
    @Query() queryParams: PrintBaggingPaperPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdPrintService.executePrintBagging(serverResponse, queryParams);
  }

  @Get('bagging-paper') // print struk
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBaggingForPaper(
    @Query() queryParams: PrintBaggingPaperPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdPrintService.printBaggingForPaper(serverResponse, queryParams);
  }

  @Get('do-smd')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoSmd(
    @Query() queryParams: PrintDoSmdPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdPrintService.printDoSmdByRequest(serverResponse, queryParams);
  }

  @Get('vendor')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printVendorForPaper(
    @Query() queryParams: PrintBaggingPaperPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdPrintService.printVendorForPaper(serverResponse, queryParams);
  }

  @Get('received-bag')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printReceivedBagForPaper(
    @Query() queryParams: PrintReceivedBagPaperPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdPrintService.printReceivedBagForPaper(serverResponse, queryParams);
  }

  @Get('received-bag/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({disable: true})
  public async executeBagCityExternalPrint(
    @Query() params: PrintReceivedBagPaperPayloadVm,
    @Response() response: express.Response,
  ) {
    return SmdPrintService.executeScaninPrint(response, params);
  }

  @Post('received-bag/store')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async storeBagCityExternalPrint(@Body() body: PrintScaninVm) {
    return SmdPrintService.storeScaninPrint(body);
  }
}
