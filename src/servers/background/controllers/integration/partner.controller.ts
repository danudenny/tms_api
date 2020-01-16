import { Body, Controller, Post } from '@nestjs/common';
import { PartnerService } from '../../services/integration/partner.service';

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
}
