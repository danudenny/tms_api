import { Controller, Get, Query, Response } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import express = require('express');

import { ResponseSerializerOptions } from '../../../shared/decorators/response-serializer-options.decorator';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';
import { PrintService } from '../services/print.service';

@ApiUseTags('General')
@Controller('print')
export class PrintController {
  @Get('do-pod')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPod(
    @Query() queryParams: PrintDoPodPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-bag')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodBag(
    @Query() queryParams: PrintDoPodBagPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodBagByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-deliver')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodDelivery(
    @Query() queryParams: PrintDoPodDeliverPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodDeliverByRequest(serverResponse, queryParams);
  }

  @Get('bag-item')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagItem(
    @Query() queryParams: PrintBagItemPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printBagItemByRequest(serverResponse, queryParams);
  }
}
