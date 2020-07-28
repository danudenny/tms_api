import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Response, Get, Query } from '@nestjs/common';
import express = require('express');
import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import {BagCityService} from '../../services/integration/bag-city.service';
import {PermissionTokenGuard} from '../../../../shared/guards/permission-token.guard';
import {ResponseSerializerOptions} from '../../../../shared/decorators/response-serializer-options.decorator';
import {BagCityResponseVm} from '../../models/bag-city-response.vm';
import {BagCityPayloadVm} from '../../models/bag-city-payload.vm';
import { PrintBagCityPayloadVm } from '../../models/print-bag-city-payload.vm';

@ApiUseTags('SMD Bag City')
@Controller('smd/bag-city')
export class BagCityController {
  constructor() {}
  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: BagCityResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async createBagging(@Body() payload: BagCityPayloadVm) {
    return BagCityService.createBagging(payload);
  }

  @Get('print')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagging(
    @Query() queryParams: PrintBagCityPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return BagCityService.printBagging(serverResponse, queryParams);
  }
}
