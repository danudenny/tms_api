import { Controller, Get, Query, Post, Logger, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { MobileDeliveryFindAllResponseVm } from '../../models/MobileDelivery.response.vm';
import { MobileDeliveryService } from '../../services/mobile/delivery.service';
import { DeliveryListVm } from '../../models/DeliveryList.vm';
import { DeliveryFilterPayloadVm } from '../../models/MobileDashboard.vm';

@ApiUseTags('Delivery List')
@Controller('api/mobile')
export class MobileDeliveryController {
  constructor(
    private readonly deliveryService: MobileDeliveryService,
  ) { }

  @Post('delivery')
  @ApiOkResponse({ type: MobileDeliveryFindAllResponseVm })
  public async findAllDelivery(@Body() payload: DeliveryFilterPayloadVm) {

    return this.deliveryService.findAllMobileDelivery(payload.page, payload.limit);
    }
  }

