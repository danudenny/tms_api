import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { DropCashLessResponseVM, DropCashlessVm } from '../../models/partner/fastpay-drop.vm';
import { PartnerFastpayService } from '../../services/integration/partner-fastpay.service';

@ApiUseTags('Partner Integration Sicepat x Fastpay')
@Controller('integration/partner')
export class PartnerFastpayController {
  constructor() {}

  @Post('fastpay/dropCash')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: DropCashLessResponseVM })
  public async dropCash(@Body() payload: DropCashlessVm) {
    return PartnerFastpayService.dropCash(payload);
  }

  @Post('fastpay/dropCashless')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: DropCashLessResponseVM })
  public async dropCashless(@Body() payload: DropCashlessVm) {
    return PartnerFastpayService.dropCashless(payload);
  }
}
