import { Body, Controller, Post, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { CpsService } from '../../services/integration/cps.service';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthApiKeyCpsGuard } from '../../guards/auth-api-key-cps.guard';
import { DownloadQueryPayloadVm } from '../../models/download-query.payload.vm';

@ApiUseTags('CPS')
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

  @Post('download/query')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthApiKeyCpsGuard)
  public async downloadQuery(@Body() payload: DownloadQueryPayloadVm) {
    return CpsService.downloadQuery(payload);
  }

}
