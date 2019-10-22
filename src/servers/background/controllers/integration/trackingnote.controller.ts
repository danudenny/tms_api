import { Body, Controller, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { TrackingNoteResponseVm } from '../../models/trackingnote.response.vm';
import { TrackingNoteService } from '../../services/integration/trackingnote.service';

// @ApiUseTags('Master Data')
@Controller('integration/trackingnote')
export class TrackingNoteController {
  constructor() {}

  @Get('sync')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async findLastAwbHistory(@Body() payload: BaseMetaPayloadVm) {
    return TrackingNoteService.findLastAwbHistory(payload);
  }
}
