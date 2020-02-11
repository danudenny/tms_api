import { Body, Controller, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { TrackingNoteService } from '../../services/integration/trackingnote.service';
import { DoReturnResponseVm } from '../../../main/models/do-return.vm';
import { ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { DoReturnSyncResponseVm } from '../../models/return-do.response.vm';
import { DoReturnService } from '../../services/integration/do-return.service';

// @ApiUseTags('Master Data')
@Controller('integration/doReturn')
export class DoReturnController {
  constructor() {}

  @Get('sync')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: DoReturnSyncResponseVm })
  public async findAllDoKembali(@Body() payload: BaseMetaPayloadVm) {
    return DoReturnService.syncDoReturn();
  }

  // @Get('updateStatus')
  // @ApiOkResponse({ type: DoReturnSyncResponseVm })
  // public async updateStatus(@Body() payload: BaseMetaPayloadVm) {
  //   return DoReturnService.syncDoReturn();
  // }
}
