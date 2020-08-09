import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { CheckSpkVm, CheckSpkResponseVM, CheckSpkPayloadVm } from '../../models/partner/diva.vm';
import { PartnerDivaService } from '../../services/integration/partner-diva.service';

@ApiUseTags('Integration Partners')
@Controller('integration/partners')
export class PartnerDivaController {
  constructor() {}

  @Get('checkSpk')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: CheckSpkResponseVM })
  public async checkSpk(@Body() payload: CheckSpkPayloadVm) {
    return PartnerDivaService.checkAwb(payload);
  }
}
