import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { WebDeliveryInService } from '../../services/web/web-delivery-in.service';
import { WebAwbFListPodResponseVm } from '../../models/web-awb-filter-list.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Web Awb Trouble')
@Controller('web/pod')
// TODO: to be remove
export class WebAwbPodController {
  constructor(
    private readonly webDeliveryService: WebDeliveryInService,
  ) {}

  @Post('podList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbFListPodResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllPodList(@Body() payload: BaseMetaPayloadVm) {
    // TODO:
    return this.webDeliveryService.findAllPodListByRequest(payload);
  }
}
