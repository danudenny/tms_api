import { Body, Controller, Post, Req } from '@nestjs/common';
import { PartnerService } from '../../services/integration/partner.service';
import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { PosindonesiaPayloadVm } from '../../models/posindonesia.payload.vm';

// @ApiUseTags('Master Data')
@Controller('integration/partner')
export class PartnerController {
  constructor() {}

  @Post('posIndonesia/awb')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async sendAwbPosIndonesia(@Body() payload: any) {
    return PartnerService.sendAwbPosIndonesia(payload);
  }

  @Post('posIndonesia/dropAwb')
  @Transactional()
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async dropAwbPosIndonesia(@Req() request: any, @Body() payload: PosindonesiaPayloadVm) {
    const apiKeyPartner = request.headers['x-api-key'];
    let result = {};
    if (!apiKeyPartner) {
       result = {
        code: '422',
        message: 'Invalid API KEY',
      };
       return result;
    }

    const partner = await Partner.findOne({
      apiKey: apiKeyPartner,
    });
    if (!partner) {
      result = {
        code: '422',
        message: 'API KEY not found',
      };
      return result;
    } else {
      if (partner.partnerName.toLocaleLowerCase() === 'pos indonesia') {
        payload.partner_id = partner.partner_id;
        return PartnerService.dropAwbPosIndonesia(payload);
      } else {
        result = {
          code: '422',
          message: 'Invalid Key',
        };
        return result;
      }
    }

  }
}
