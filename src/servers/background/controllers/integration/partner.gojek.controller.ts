import { Body, Controller, Post, Put, Get, UseGuards, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthGojekGuard } from '../../../../shared/guards/auth-gojek.guard';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { PartnerGojekService } from '../../services/integration/partner.gojek.service';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { GojekBookingPickupVm, GojekBookingPickupResponseVm } from '../../models/partner/gojek-booking-pickup.vm';

@ApiUseTags('Partner Integration Gojek')
@Controller('integration')
@ApiBearerAuth()
export class PartnerGojekController {
  constructor() {}

  @Post('gojek/createBooking/pickup')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GojekBookingPickupResponseVm })
  public async createBokingPickup(@Body() payload: GojekBookingPickupVm) {
    return PartnerGojekService.createBookingPickup(payload);
  }

  @Put('gojek/cancelBooking')
  @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async cancelBooking(@Body() payload: any) {
    return {};
  }

  @Get('gojek/estimatePrice')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async estimatePrice(@Body() payload: any) {
    return null; // PartnerGojekService.getEstimatePrice();
  }

  @Get('gojek/checkOrderStatus/:orderNo')
  @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async checkOrderStatus(@Param('orderNo') orderNo: string) {
    return PartnerGojekService.getStatusOrder(orderNo);
  }

  @Post('gojek/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGojekGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async webHookCallback(@Body() payload: any) {
    PinoLoggerService.log(payload);
    return { status: 'ok', message: 'success' };
  }
}
