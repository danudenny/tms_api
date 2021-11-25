import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BagTroublePayloadVm } from '../../models/bag-trouble-payload.vm';
import { BagTroubleResponseVm } from '../../models/bag-trouble-response.vm';

@ApiUseTags('Web Bag Pod')
@Controller('web/pod')
// TODO: to be remove
export class WebBagPodController {
  @Post('bagTroubledList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BagTroubleResponseVm })
  public async troubledList(@Body() payload: BagTroublePayloadVm) {
    return {};
  }
}
