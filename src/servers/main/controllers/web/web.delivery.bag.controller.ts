import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';

import { AwbRepository } from '../../../../shared/orm-repository/mobile-delivery.repository';

import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInBagResponseVm } from '../../models/web-scanIn.bag.response.vm';
const logger = require('pino')();

@ApiUseTags('Scan In Bag')
@Controller('api/web/pod/scanIn/bag')
export class WebDeliveryControllerbag {
  constructor(
    private readonly awbRepository: AwbRepository,
  ) { }

  @Post()
  @ApiOkResponse({ type: WebScanInBagResponseVm})
  public async Web(@Body() payload: WebScanInBagVm) {
    const Web = await this.awbRepository.create(
      // payload.clientId,
    );

    return Web;
  }
}
