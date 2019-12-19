import { Body, Controller, Post } from '@nestjs/common';

// import { BagPayloadVm } from '../../models/bag.payload.vm';
import { CpsService } from '../../services/integration/Cps.service';

// @ApiUseTags('Master Data')
@Controller('integration/cps')
export class CpsController {
  constructor() {}

  @Post('bag')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async postBag(@Body() payload: any) {
    return CpsService.postBag(payload);
  }
}
