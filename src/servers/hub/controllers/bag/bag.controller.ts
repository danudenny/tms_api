import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import express = require('express');

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  HUB_BAG_SERVICE,
  HubBagService,
} from '../../interfaces/hub-bag.interface';
import {
  HubBagInsertAwbPayload,
  HubBagInsertAwbResponse,
  PrintHubBagQuery,
} from '../../models/bag/hub-bag.payload';

@ApiUseTags('Hub Bags Controller')
@Controller('hub/bag')
export class HubBagController {
  constructor(
    @Inject(HUB_BAG_SERVICE) private readonly hubBagService: HubBagService,
  ) {}

  @Post('awb')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public insertAWB(
    @Body() payload: HubBagInsertAwbPayload,
  ): Promise<HubBagInsertAwbResponse> {
    return this.hubBagService.insertAWB(payload);
  }

  @Get('print')
  public async print(
    @Query() query: PrintHubBagQuery,
    @Response() rw: express.Response,
  ): Promise<any> {
    const bagItem = await this.hubBagService.get(query.bagItemId);
    await this.hubBagService.print(bagItem, query.userId, query.branchId, rw);
  }
}
