import { Body, Controller, Post, Put, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthGojekGuard } from '../../../../shared/guards/auth-gojek.guard';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { PartnerGojekService } from '../../services/integration/partner.gojek.service';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Partner Integration Gojek')
@Controller('integration')
@ApiBearerAuth()
export class PartnerGojekController {
  constructor() {}

  @Post('gojek/createBooking/pickup')
  @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async createBokingPickup(@Body() payload: any) {
    return {};
  }

  @Post('gojek/createBooking/deliver')
  @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async createBokingDeliver(@Body() payload: any) {
    return {};
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
    return PartnerGojekService.getEstimatePrice();
  }

  @Get('gojek/checkOrderStatus')
  @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async checkOrderStatus(@Body() payload: any) {
    return PartnerGojekService.getStatusOrder();
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
