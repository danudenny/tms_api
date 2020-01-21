import { Body, Controller, Post, Req } from '@nestjs/common';
import { PartnerService } from '../../services/integration/partner.service';
import { Partner } from '../../../../shared/orm-entity/partner';

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
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async dropAwbPosIndonesia(@Req() payload: any) {
    const apiKeyPartner = payload.headers['x-api-key'];
    let result = {};
    if (!apiKeyPartner) {
       result = {
        code: '422',
        message: 'Invalid API KEY',
      };
       return result;
    }

    const partner = await Partner.findOne({
      api_key: apiKeyPartner,
    });
    if (!partner) {
      result = {
        code: '422',
        message: 'API KEY not found',
      };
      return result;
    } else {
      if (partner.partner_name.toLocaleLowerCase() === 'pos indonesia') {
        return PartnerService.dropAwbPosIndonesia(payload.body['awb']);
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
