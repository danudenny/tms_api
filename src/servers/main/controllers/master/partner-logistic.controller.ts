import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PartnerLogisticFindAllResponseVm, PartnerLogisticPayloadVm } from '../../models/partner-logistic.vm';
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
  public async listPartnerLogistic(@Body() payload: PartnerLogisticPayloadVm) {

    return this.partnerLogisticService.listData(payload);
  }
}
