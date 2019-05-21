import { Controller, Get, Query, Post, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { MobileDeliveryFindAllResponseVm } from '../../models/MobileDelivery.response.vm';
import { MobileDeliveryService } from '../../services/mobile/delivery.service';

@ApiUseTags('Delivery List')
@Controller('api/mobile')
export class MobileDeliveryController {
  constructor(
    private readonly deliveryService: MobileDeliveryService,
  ) { }

  @Post('delivery')
  @ApiOkResponse({ type: MobileDeliveryFindAllResponseVm })
  public async findAllMobileDelivery(@Query('page') page: number, @Query('limit') take: number,
  ) {
    return this.deliveryService.findAllMobileDelivery(page, take);
  }
}
