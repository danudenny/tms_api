import { Controller, Get, Query, Response } from '@nestjs/common';
import express = require('express');

import { ResponseSerializerOptions } from '../../../shared/decorators/response-serializer-options.decorator';
import { PrintBagItemPayloadQueryVm, PrintAwbPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';
import { PrintService } from '../services/print.service';
import { ApiUseTags, ApiBearerAuth } from '../../../shared/external/nestjs-swagger';
import { PrintDoPodService } from '../services/print-do-pod.service';
import { PrintDoPodBagService } from '../services/print-do-pod-bag.service';
import { PrintDoPodDeliverService } from '../services/print-do-pod-deliver.service';
import { PrintDoPodReturnPayloadQueryVm } from '../models/print-do-pod-return.vm';
import { PrintBagItemPaperService } from '../services/print-bag-item-paper.service';
import { PrintBagItemStickerService } from '../services/print-bag-item-sticker.service';

@ApiUseTags('Print')
@Controller('print')
export class PrintController {
  @Get('do-pod')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPod(
    @Query() queryParams: PrintDoPodPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintDoPodService.printDoPodByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-bag')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodBag(
    @Query() queryParams: PrintDoPodBagPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintDoPodBagService.printDoPodBagByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-deliver')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodDelivery(
    @Query() queryParams: PrintDoPodDeliverPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintDoPodDeliverService.printDoPodDeliverByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-return')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodReturn(
    @Query() queryParams: PrintDoPodDeliverPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodReturnByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-return-transit')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodReturnTransit(
    @Query() queryParams: PrintDoPodDeliverPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodReturnTransitByRequest(serverResponse, queryParams);
  }

  @Get('bag-item-for-sticker')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagItemSticker(
    @Query() queryParams: PrintBagItemPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintBagItemStickerService.printBagItemStickerByRequest(serverResponse, queryParams);
  }

  @Get('bag-item-for-paper')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagItemPaper(
    @Query() queryParams: PrintBagItemPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintBagItemPaperService.printBagItemPaperByRequest(serverResponse, queryParams);
  }

  @Get('bag-item-sticker-paper')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagItemStickerPaper(
    @Query() queryParams: PrintBagItemPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printBagItemStickerAndPaperByRequest(serverResponse, queryParams);
  }

  @Get('awb-for-sticker')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printAwbSticker(
    @Query() queryParams: PrintAwbPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printAwbForStickerByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-do-return')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodDoReturn(
    @Query() queryParams: PrintDoPodReturnPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodDoReturnByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-do-return-admin')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodDoReturnAdmin(
    @Query() queryParams: PrintDoPodReturnPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodDoReturnAdminByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-do-return-ct')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodDoReturnCt(
    @Query() queryParams: PrintDoPodReturnPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodDoReturnCtByRequest(serverResponse, queryParams);
  }

  @Get('do-pod-do-return-collection')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodDoReturnCollection(
    @Query() queryParams: PrintDoPodReturnPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintService.printDoPodDoReturnCollectionByRequest(serverResponse, queryParams);
  }
}
