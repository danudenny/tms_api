import {
  TrackingAwbPayloadVm,
  TrackingBagPayloadVm,
  TrackingAwbResponseVm,
  TrackingBagResponseVm,
  TrackingBagRepresentativePayloadVm,
  TrackingBagRepresentativeResponseVm,
} from '../../models/tracking.vm';
import {
  ApiUseTags,
  ApiBearerAuth,
  ApiOkResponse,
} from '../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { WebTrackingService } from '../../services/web/web-tracking.service';

@ApiUseTags('Web Tracking')
@Controller('web/tracking')
// @ApiBearerAuth()
export class WebTrackingController {
  @Post('awbNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TrackingAwbResponseVm })
  public async awbNumber(@Body() payload: TrackingAwbPayloadVm) {
    return WebTrackingService.awb(payload);
  }

  @Post('bagNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TrackingBagResponseVm })
  public async bagNumber(@Body() payload: TrackingBagPayloadVm) {
    return WebTrackingService.bag(payload);
  }
}
