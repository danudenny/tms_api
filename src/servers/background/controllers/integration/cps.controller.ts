import { Body, Controller, Post } from '@nestjs/common';

// import { BagPayloadVm } from '../../models/bag.payload.vm';
import { CpsService } from '../../services/integration/cps.service';

// @ApiUseTags('Master Data')
@Controller('integration/cps')
export class CpsController {
  constructor() {}

  @Post('bag')
  public async bag(@Body() payload: any) {
    return CpsService.bag(payload);
  }

  @Post('stt/mysql')
  public async sttMysql(@Body() payload: any) {
    return CpsService.sttMysql(payload);
  }

}
