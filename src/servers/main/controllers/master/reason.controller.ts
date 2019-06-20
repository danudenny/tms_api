import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BranchPayloadVm } from '../../models/branch.vm';
import { ReasonService } from '../../services/master/reason.services';
import { ReasonFindAllResponseVm, ReasonPayloadVm } from '../../models/reason.vm';

@ApiUseTags('Master Data')
@Controller('master/reason')
export class ReasonController {
  constructor(private readonly reasonService: ReasonService) {}

  @Post('list')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: ReasonFindAllResponseVm })
  public async listReason(@Body() payload: ReasonPayloadVm) {

    return this.reasonService.listData(payload);
  }
}
