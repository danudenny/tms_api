import { Controller, Get, Query, Post, Logger, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { MobileDeliveryFindAllResponseVm } from '../../models/mobile-delivery.response.vm';
import { MobileDeliveryService } from '../../services/mobile/delivery.service';
import { DeliveryFilterPayloadVm, DeliveryListPayloadVm, MobileDashboardhistVm } from '../../models/mobile-dashboard.vm';
import { RedeliveryService } from '../../services/mobile/redelivery.services';
import { RedeliveryFindAllResponseVm } from '../../models/redelivery.response.vm';

@ApiUseTags('Delivery List')
@Controller('api/mobile')
export class MobileDeliveryController {
  constructor(
    private readonly deliveryService: MobileDeliveryService,
    private readonly redeliveryService: RedeliveryService,
  ) { }

  @Post('delivery')
  @ApiOkResponse({ type: MobileDeliveryFindAllResponseVm })
  public async findAllDelivery(@Body() payload: DeliveryFilterPayloadVm) {

    return this.deliveryService.findalldelivery(payload);
    }

  @Post('redeliveryHistory')
  @ApiOkResponse({ type: RedeliveryFindAllResponseVm })
  public async findAllHistoryDelivery(@Body() payload: DeliveryFilterPayloadVm) {

    return this.redeliveryService.findAllHistoryDelivery(payload);
    }
  }

