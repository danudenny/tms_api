import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Param, Get } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DoReturnStatusFindAllResponseVm } from '../../models/master/do-return-status.vm';
import { DoReturnStatusService } from '../../services/master/do-return-status.service';

@ApiUseTags('Master Data')
@Controller('master/doReturnStatus')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
export class DoReturnStatusController {
  constructor() {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DoReturnStatusFindAllResponseVm })
  public async findAllList(
    @Body() payload: BaseMetaPayloadVm,
  ) {
    return DoReturnStatusService.findAllList(payload);
  }
}
