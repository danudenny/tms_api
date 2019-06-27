import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AwbTroublePayloadVm } from '../../models/awb-trouble-payload.vm';
import { AwbTroubleResponseVm } from '../../models/awb-trouble-response.vm';
import { WebAwbTroubleService } from '../../services/web/web-awb-trouble.service';

@ApiUseTags('Web Awb Trouble')
@Controller('web/pod')
export class WebAwbTroubleControlelr {
  @Post('troubledList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbTroubleResponseVm })
  public async troubledList(@Body() payload: AwbTroublePayloadVm) {
    return WebAwbTroubleService.findAllByRequest(payload);
  }
}
