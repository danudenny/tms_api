import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';

import { awbRepository } from '../../../../shared/orm-repository/MobileDelivery.repository';

import { WebScanInBagVm } from '../../models/WebScanInBag.vm';
import { WebScanInBagResponseVm } from '../../models/WebScanIn.bag.response.vm';
const logger = require('pino')();

@ApiUseTags('Scan In Bag')
@Controller('api/web/pod/scanIn/bag')
export class WebDeliveryControllerbag {
  constructor(
    private readonly awbRepository: awbRepository,
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
