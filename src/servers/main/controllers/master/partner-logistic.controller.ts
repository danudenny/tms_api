import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { PartnerLogisticFindAllResponseVm } from '../../models/partner-logistic.vm';
import { PartnerLogisticService } from '../../services/master/partner-logistic.service';

@ApiUseTags('Master Data')
@Controller('master/partnerLogistic')
export class PartnerLogisticController {
  constructor(
    private readonly partnerLogisticService: PartnerLogisticService,
  ) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PartnerLogisticFindAllResponseVm })
  public async listPartnerLogistic(@Body() payload: BaseMetaPayloadVm) {
    return this.partnerLogisticService.findAllByRequest(payload);
  }
}
