import {
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Body,
  Get,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { V1MobileDivaPaymentService } from '../../services/mobile/v1/mobile-diva-payment.service';
import { ResponseMaintenanceService } from '../../../../shared/services/response-maintenance.service';

@ApiUseTags('Cod Diva Payment')
@Controller('mobile/cod-payment')
@ApiBearerAuth()
export class CodPaymentController {
  constructor(private readonly divaService: V1MobileDivaPaymentService) {}

  // @Get('diva/pingQR')
  // @ResponseSerializerOptions({ disable: true })
  // public async divaPaymentPingQR() {
  //   return V1MobileDivaPaymentService.pingQR();
  // }

  @Get('diva/testGetQR')
  @ResponseSerializerOptions({ disable: true })
  public async divaPaymentTestGetQR() {
    return this.divaService.getTestQR();
  }

  // @Post('diva/getQR')
  // @HttpCode(HttpStatus.OK)
  // // NOTE: for tesing only
  // // @UseGuards(AuthenticatedGuard)
  // @ResponseSerializerOptions({ disable: true })
  // public async divaPaymentGetQR(@Body() payload: any) {
  //   return V1MobileDivaPaymentService.getQr(payload);
  // }

  // @Post('diva/sendQR')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard)
  // @ResponseSerializerOptions({ disable: true })
  // public async divaPaymentSendQR(@Body() payload: any) {
  //   // NOTE: handle for message disable this service
  //   ResponseMaintenanceService.divaPaymentService();
  //   return V1MobileDivaPaymentService.sendQr(payload);
  // }

  // @Post('diva/paymentStatus')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard)
  // @ResponseSerializerOptions({ disable: true })
  // public async divaPaymentStatus(@Body() payload: any) {
  //   // NOTE: handle for message disable this service
  //   ResponseMaintenanceService.divaPaymentService();
  //   return V1MobileDivaPaymentService.paymentStatus(payload);
  // }
}
