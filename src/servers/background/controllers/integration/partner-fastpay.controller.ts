import { Body, Controller, Post, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PartnerService } from '../../services/integration/partner.service';
import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { PosindonesiaPayloadVm } from '../../models/posindonesia.payload.vm';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PartnerFastpayService } from '../../services/integration/partner-fastpay.service';
import { DropCashlessVm } from '../../models/partner/fastpay-drop.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Partner Integration Sicepat x Fastpay')
@Controller('integration/partner')
export class PartnerFastpayController {
  constructor() {}

  @Post('fastpay/drop/cashless')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  @ResponseSerializerOptions({ disable: true })
  public async dropCashless(@Body() payload: DropCashlessVm) {
    return PartnerFastpayService.dropCashless(payload);
  }

}
