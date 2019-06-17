import { Controller, Get, Query, Post, Logger, Body, HttpCode, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { MobileDeliveryFindAllResponseVm } from '../../models/mobile-delivery.response.vm';
import { MobileDeliveryService } from '../../services/mobile/delivery.service';
import { DeliveryFilterPayloadVm, DeliveryListPayloadVm, MobileDashboardhistVm } from '../../models/mobile-dashboard.vm';
import { RedeliveryService } from '../../services/mobile/redelivery.services';
import { RedeliveryFindAllResponseVm } from '../../models/redelivery.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Delivery List')
@Controller('mobile')
export class MobileDeliveryController {
  constructor(
    private readonly deliveryService: MobileDeliveryService,
    private readonly redeliveryService: RedeliveryService,
  ) { }

  @Post('delivery')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  // @ApiOkResponse({ type: MobileDeliveryFindAllResponseVm })
  public async findAllDelivery(@Body() payload: DeliveryFilterPayloadVm) {

    return this.deliveryService.findalldelivery(payload);
    }

  @Post('redeliveryHistory')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: RedeliveryFindAllResponseVm })
  public async findAllHistoryDelivery(@Body() payload: DeliveryFilterPayloadVm) {

    return this.redeliveryService.findAllHistoryDelivery(payload);
    }
  }

