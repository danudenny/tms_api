import { Body, Controller, Post, Req, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { PartnerService } from '../../services/integration/partner.service';
import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { PosindonesiaPayloadVm } from '../../models/posindonesia.payload.vm';
import { ApiUseTags, ApiImplicitHeader } from '../../../../shared/external/nestjs-swagger';
import { ResponseMaintenanceService } from '../../../../shared/services/response-maintenance.service';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';

@ApiUseTags('Partner Integration Pos Indonesia')
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
  public async dropAwbPosIndonesia(
    @Req() request: any,
    @Body() payload: PosindonesiaPayloadVm,
  ) {
    // NOTE: handle for message disable this service
    await ResponseMaintenanceService.dropService();

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
        payload.partner_id = partner.partnerId;
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

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  public async getSummary(@Req() req: any) {
    return PartnerService.getSummary(req.headers);
  }
}
