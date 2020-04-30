import {
  TrackingAwbPayloadVm,
  TrackingAwbResponseVm,
  AwbSubstituteResponseVm,
} from '../../../models/tracking.vm';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiBearerAuth,
} from '../../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body, UseGuards } from '@nestjs/common';
import { V1WebTrackingService } from '../../../services/web/v1/web-tracking.service';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PhotoDetailVm } from '../../../models/bag-order-response.vm';
import { PhotoResponseVm } from '../../../models/bag-order-detail-response.vm';

@ApiUseTags('Web Tracking')
@Controller('web/v1/tracking')
@ApiBearerAuth()
export class V1WebTrackingController {
  @Post('awbNumber')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: TrackingAwbResponseVm })
  public async awbNumber(@Body() payload: TrackingAwbPayloadVm) {
    return V1WebTrackingService.awb(payload);
  }

  @Post('awbSubstitute')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbSubstituteResponseVm })
  public async awbSubstitute(@Body() payload: BaseMetaPayloadVm) {
    return V1WebTrackingService.getAwbSubstitute(payload);
  }

  @Post('photoDetail')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PhotoResponseVm })
  public async photoDetail(@Body() payload: PhotoDetailVm) {
    return V1WebTrackingService.getPhotoDetail(payload);
  }
}
