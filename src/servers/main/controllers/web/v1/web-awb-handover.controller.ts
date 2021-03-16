import {
   Body, Controller, HttpCode, HttpStatus, Post,
} from '@nestjs/common';

import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { V1WebAwbHandoverService } from '../../../services/web/v1/web-awb-handover.service';
import { AwbHandoverListResponseVm } from '../../../models/last-mile/awb-handover.vm';

@ApiUseTags('Awb Handover')
@Controller('web/v1/handover')
// @ApiBearerAuth()
export class V1WebAwbHandoverController {
  constructor() {}

  @Post('awbList')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbHandoverListResponseVm })
  public async ApiAwbList(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbHandoverService.AwbHandoverList(payload);
  }

  @Post('awbList/count')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbHandoverListResponseVm })
  public async ApiAwbCount(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbHandoverService.AwbHandoverListCount(payload);
  }
}