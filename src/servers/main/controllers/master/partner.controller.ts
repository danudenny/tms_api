import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { PartnerFindAllResponseVm } from '../../models/partner.vm';
import { PartnerService } from '../../services/master/partner.service';

@ApiUseTags('Master Data')
@Controller('master/partner')
export class MasterPartnerController {
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PartnerFindAllResponseVm })
  public async listPartner(@Body() payload: BaseMetaPayloadVm) {
    return PartnerService.findAllByRequest(payload);
  }
}
