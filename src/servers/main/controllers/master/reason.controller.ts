import { Controller, Post, UseGuards, HttpCode, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ReasonService } from '../../services/master/reason.service';
import { ReasonFindAllResponseVm } from '../../models/reason.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

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

    return this.reasonService.listData(payload);
  }
}
