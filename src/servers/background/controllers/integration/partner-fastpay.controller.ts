import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { PartnerFastpayService } from '../../services/integration/partner-fastpay.service';
import { DropCashlessVm } from '../../models/partner/fastpay-drop.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { AuthFastpayGuard } from '../../../../shared/guards/auth-fastpay.guard';

@ApiUseTags('Partner Integration Sicepat x Fastpay')
@Controller('integration/partner')
@ApiBearerAuth()
export class PartnerFastpayController {
  constructor() {}

  @Post('fastpay/drop/cashless')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthFastpayGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  @ResponseSerializerOptions({ disable: true })
  public async dropCashless(@Body() payload: DropCashlessVm) {
    return PartnerFastpayService.dropCashless(payload);
  }
}
