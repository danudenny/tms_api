import { Body, Controller, Get, Post, Query, Response } from '@nestjs/common';
import express = require('express');

import { ResponseSerializerOptions } from '../../../shared/decorators/response-serializer-options.decorator';
import { PrintDoPodBagPayloadQueryVm } from '../models/print-do-pod-bag-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';
import { ApiUseTags, ApiBearerAuth } from '../../../shared/external/nestjs-swagger';
import { PrintDoPodVm } from '../models/print-do-pod.vm';
import { PrintDoPodBagVm } from '../models/print-do-pod-bag.vm';
import { PrintDoPodDeliverVm } from '../models/print-do-pod-deliver.vm';
import { PrintByStoreService } from '../services/print-by-store.service';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintBagItemPaperVm } from '../models/print-bag-item-paper.vm';
import { PrintBagItemStickerVm } from '../models/print-bag-item-sticker.vm';

@ApiUseTags('General')
@Controller('print-by-store')
export class PrintByStoreController {
  @Post('do-pod/store')
  @ApiBearerAuth()
  public async storePrintDoPod(
    @Body() payloadBody: PrintDoPodVm,
  ) {
    return PrintByStoreService.storePrintDoPod(payloadBody);
  }

  @Get('do-pod/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async executePrintDoPod(
    @Query() queryParams: PrintDoPodPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintByStoreService.executePrintDoPod(serverResponse, queryParams);
  }

  @Post('do-pod-bag/store')
  @ApiBearerAuth()
  public async storePrintDoPodBag(
    @Body() payloadBody: PrintDoPodBagVm,
  ) {
    return PrintByStoreService.storePrintDoPodBag(payloadBody);
  }

  @Get('do-pod-bag/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async executePrintDoPodBag(
    @Query() queryParams: PrintDoPodBagPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintByStoreService.executePrintDoPodBag(serverResponse, queryParams);
  }

  @Post('do-pod-deliver/store')
  @ApiBearerAuth()
  public async storePrintDoPodDeliver(
    @Body() payloadBody: PrintDoPodDeliverVm,
  ) {
    return PrintByStoreService.storePrintDoPodDeliver(payloadBody);
  }

  @Get('do-pod-deliver/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async executePrintDoPodDelivery(
    @Query() queryParams: PrintDoPodDeliverPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintByStoreService.executePrintDoPodDeliver(serverResponse, queryParams);
  }

  @Post('bag-item-for-paper/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePrintBagItemPaper(
    @Body() payloadBody: PrintBagItemPaperVm,
  ) {
    return PrintByStoreService.storePrintBagItemPaper(payloadBody);
  }

  @Get('bag-item-for-paper/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async executePrintBagItemPaper(
    @Query() queryParams: PrintBagItemPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintByStoreService.executePrintBagItemPaper(serverResponse, queryParams);
  }

  @Post('bag-item-for-sticker/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePrintBagItemSticker(
    @Body() payloadBody: PrintBagItemStickerVm,
  ) {
    return PrintByStoreService.storePrintBagItemSticker(payloadBody);
  }

  @Get('bag-item-for-sticker/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async executePrintBagItemSticker(
    @Query() queryParams: PrintBagItemPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    return PrintByStoreService.executePrintBagItemSticker(serverResponse, queryParams);
  }
}