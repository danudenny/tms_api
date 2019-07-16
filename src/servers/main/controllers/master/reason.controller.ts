import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ReasonFindAllResponseVm } from '../../models/reason.vm';
import { ReasonService } from '../../services/master/reason.service';

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
  public async listReason(@Body() payload: BaseMetaPayloadVm) {
    return this.reasonService.findAllByRequest(payload);
  }
}
