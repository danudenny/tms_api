import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth, ApiOkResponse, ApiImplicitHeader } from '../../../../shared/external/nestjs-swagger';
import { PartnerFastpayService } from '../../services/integration/partner-fastpay.service';
import { DropCashlessVm, DropCashLessResponseVM } from '../../models/partner/fastpay-drop.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { AuthFastpayGuard } from '../../../../shared/guards/auth-fastpay.guard';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';

@ApiUseTags('Partner Integration Sicepat x Fastpay')
@Controller('integration/partner')
export class PartnerFastpayController {
  constructor() {}

  @Post('fastpay/dropCash')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: DropCashLessResponseVM })
  // @ResponseSerializerOptions({ disable: true })
  public async dropCash(@Body() payload: DropCashlessVm) {
    return PartnerFastpayService.dropCash(payload);
  }

  @Post('fastpay/dropCashless')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: DropCashLessResponseVM })
  // @ResponseSerializerOptions({ disable: true })
  public async dropCashless(@Body() payload: DropCashlessVm) {
    return PartnerFastpayService.dropCashless(payload);
  }
}
