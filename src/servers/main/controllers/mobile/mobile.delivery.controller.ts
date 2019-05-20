import { Controller, Get, Query, Post, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { mobiledeliveryService } from '../../../main/services/Mobile/mobile.delivery.services';
import { MobileDeliveryFindAllResponseVm } from '../../models/MobileDelivery.response.vm';

const logger = require('pino')();

@ApiUseTags('Delivery List')
@Controller('api/mobile')
export class MobileDeliveryController {
  constructor(
    private readonly mobiledeliveryService: mobiledeliveryService,
  ) { }

  @Post('delivery')
  @ApiOkResponse({ type: MobileDeliveryFindAllResponseVm })
  public async findAllMobileDelivery(@Query('page') page: number,@Query('limit') take: number,
  ) {
    return this.mobiledeliveryService.findAllMobileDelivery(page, take);
  }
}
