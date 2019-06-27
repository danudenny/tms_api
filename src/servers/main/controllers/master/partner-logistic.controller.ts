import { Controller, Post, UseGuards, HttpCode, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PartnerLogisticFindAllResponseVm } from '../../models/partner-logistic.vm';
import { PartnerLogisticService } from '../../services/master/partner-logistic.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

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

    return this.partnerLogisticService.listData(payload);
  }
}
