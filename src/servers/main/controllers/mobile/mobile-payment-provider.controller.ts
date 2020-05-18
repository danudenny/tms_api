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
import {ProviderOfPaymentService} from '../../services/web/provider-of-payment.service';
import {ListProviderResponseVm, MobileProviderPaymentDivaResponseVm} from '../../models/payment-provider-response.vm';
import {MobileProviderPaymentDivaPayloadVm} from '../../models/payment-provider-payload';

@ApiUseTags('Payment Provider')
@Controller('mobile/payment-provider')
export class PaymentProviderController {
  constructor() {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: ListProviderResponseVm })
  public async getListPaymentProvider() {
    return ProviderOfPaymentService.getListPaymentProvider();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileProviderPaymentDivaResponseVm })
  public async sendPaymentToOdooDiva(
    @Body() payload: MobileProviderPaymentDivaPayloadVm,
  ) {
    return ProviderOfPaymentService.sendPayment(payload);
  }
}
