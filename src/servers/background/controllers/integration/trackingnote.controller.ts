import { Body, Controller, Get } from '@nestjs/common';

import { TrackingNotePayloadVm } from '../../models/trackingnote.payload.vm';
import { TrackingNoteService } from '../../services/integration/trackingnote.service';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';

@ApiUseTags('Tracking Note')
@Controller('integration/trackingnote')
export class TrackingNoteController {
  constructor() {}

  @Get('sync')
  public async findLastAwbHistory(@Body() payload: any) {
    return TrackingNoteService.findLastAwbHistory(payload);
  }

  @Get('sync-manual')
  public async findLastAwbHistoryManual(@Body() payload: TrackingNotePayloadVm) {
    return TrackingNoteService.findLastAwbHistoryManual(payload);
  }
}
