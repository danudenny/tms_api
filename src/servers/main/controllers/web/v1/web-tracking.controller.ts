import {
  TrackingAwbPayloadVm,
  TrackingAwbResponseVm,
  AwbSubstituteResponseVm,
} from '../../../models/tracking.vm';
import {
  ApiUseTags,
  ApiOkResponse,
} from '../../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { V1WebTrackingService } from '../../../services/web/v1/web-tracking.service';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Web Tracking')
@Controller('web/v1/tracking')
export class V1WebTrackingController {
  @Post('awbNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TrackingAwbResponseVm })
  public async awbNumber(@Body() payload: TrackingAwbPayloadVm) {
    return V1WebTrackingService.awb(payload);
  }

  @Post('awbSubstitute')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbSubstituteResponseVm })
  public async awbSubstitute(@Body() payload: BaseMetaPayloadVm) {
    return V1WebTrackingService.getAwbSubstitute(payload);
  }

}
