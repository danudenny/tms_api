import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import {
    ResponseSerializerOptions,
} from '../../../../../shared/decorators/response-serializer-options.decorator';
import { ApiBearerAuth, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import {
    ResponseMaintenanceService,
} from '../../../../../shared/services/response-maintenance.service';
import {
    V1MobileDivaPaymentService,
} from '../../../services/mobile/v1/mobile-diva-payment.service';

@ApiUseTags('Cod Diva Payment')
@Controller('mobile/v2/cod-payment')
@ApiBearerAuth()
export class V2CodPaymentController {
  constructor() {}

  @Get('diva/pingQR')
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentPingQR() {
    return V1MobileDivaPaymentService.pingQR();
  }

  @Post('diva/getQR')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentGetQR(@Body() payload: any) {
    return V1MobileDivaPaymentService.getQr(payload);
  }

  @Post('diva/sendQR')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentSendQR(@Body() payload: any) {
    // NOTE: handle for message disable this service
    ResponseMaintenanceService.divaPaymentService();
    return V1MobileDivaPaymentService.sendQr(payload);
  }

  @Post('diva/paymentStatus')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentStatus(@Body() payload: any) {
    // NOTE: handle for message disable this service
    ResponseMaintenanceService.divaPaymentService();
    return V1MobileDivaPaymentService.paymentStatus(payload);
  }

}
