import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PartnerLogisticFindAllResponseVm, PartnerLogisticPayloadVm } from '../../models/partner-logistic.vm';

@ApiUseTags('Master Data')
@Controller('master/partnerLogistic')
export class PartnerLogisticController {
  constructor(
    // private readonly branchService: BranchServ,ice
  ) {}

  @Post('list')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PartnerLogisticFindAllResponseVm })
  public async listPartnerLogistic(@Body() payload: PartnerLogisticPayloadVm) {

    return null; // this.branchService.findBranchName(payload);
  }
}
