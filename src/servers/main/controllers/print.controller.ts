import { Controller, Get, Query, Response, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import express = require('express');

import { ResponseSerializerOptions } from '../../../shared/decorators/response-serializer-options.decorator';
import { AuthenticatedGuard } from '../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../shared/guards/permission-token.guard';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { PrintDoPodDeliverPayloadQueryVm } from '../models/print-do-pod-deliver-payload.vm';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';
import { PrintService } from '../services/print.service';

@ApiUseTags('General')
@Controller('print')
export class PrintController {
  @Get('do-pod')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @UseGuards(PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async printDoPod(
    @Query() queryParams: PrintDoPodPayloadQueryVm,
    @Response() serverResponse: { res: express.Response },
  ) {
    return PrintService.printDoPodByRequest(serverResponse.res, queryParams);
  }

  @Get('do-pod-deliver')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @UseGuards(PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodDelivery(
    @Query() queryParams: PrintDoPodDeliverPayloadQueryVm,
    @Response() serverResponse: { res: express.Response },
  ) {
    return PrintService.printDoPodDeliverByRequest(serverResponse.res, queryParams);
  }

  @Get('bag-item')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @UseGuards(PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async printBagItem(
    @Query() queryParams: PrintBagItemPayloadQueryVm,
    @Response() serverResponse: { res: express.Response },
  ) {
    return PrintService.printBagItemByRequest(serverResponse.res, queryParams);
  }
}
