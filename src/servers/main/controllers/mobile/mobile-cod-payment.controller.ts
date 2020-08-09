import {
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { MobileProviderPaymentDivaResponseVm } from '../../models/payment-provider-response.vm';
import { MobileProviderPaymentDivaPayloadVm } from '../../models/payment-provider-payload';
import {PaymentService} from '../../services/web/payment.service';

@ApiUseTags('Cod Payment')
@Controller('mobile/cod-payment')
export class CodPaymentController {
  constructor() {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileProviderPaymentDivaResponseVm })
  public async sendPaymentToOdooDiva(
    @Body() payload: MobileProviderPaymentDivaPayloadVm,
  ) {
    return PaymentService.sendPayment(payload);
  }
}
