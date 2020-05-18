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
import {ListProviderResponseVm } from '../../models/payment-provider-response.vm';

@ApiUseTags('Payment Provider')
@Controller('mobile/payment-provider')
export class PaymentProviderController {
  constructor() {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async getListPaymentProvider() {
    return ProviderOfPaymentService.getListPaymentProvider();
  }
}
