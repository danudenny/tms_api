import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ReasonService } from '../../services/master/reason.service';
import { ReasonFindAllResponseVm, ReasonPayloadVm } from '../../models/reason.vm';

@ApiUseTags('Master Data')
@Controller('master/reason')
export class ReasonController {
  constructor(
    private readonly reasonService: ReasonService,
  ) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: ReasonFindAllResponseVm })
  public async listReason(@Body() payload: ReasonPayloadVm) {

    return this.reasonService.listData(payload);
  }
}
