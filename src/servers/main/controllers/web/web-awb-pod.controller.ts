import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { AwbTroublePayloadVm } from '../../models/awb-trouble-payload.vm';
import { AwbTroubleResponseVm } from '../../models/awb-trouble-response.vm';
import { WebAwbTroubleService } from '../../services/web/web-awb-trouble.service';
import { WebDeliveryInService } from '../../services/web/web-delivery-in.service';
import { WebAwbFListPodResponseVm } from '../../models/web-awb-filter-list.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Web Awb Trouble')
@Controller('web/pod')
export class WebAwbPodController {
  constructor(
    private readonly webDeliveryService: WebDeliveryInService,
  ) {}

  @Post('troubledList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbTroubleResponseVm })
  public async troubledList(@Body() payload: AwbTroublePayloadVm) {
    return WebAwbTroubleService.findAllByRequest(payload);
  }

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
