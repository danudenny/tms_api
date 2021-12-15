import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { PhotoResponseVm } from '../../../models/bag-order-detail-response.vm';
import { PhotoDetailVm } from '../../../models/bag-order-response.vm';
import {
    AwbSubstituteResponseVm, TrackingAwbPayloadVm, TrackingAwbResponseVm, TrackingBagPayloadVm,
    TrackingBagResponseVm,
    AwbPhotoDetailVm,
    AwbPhotoResponseVm,
    TrackingBagRepresentativeResponseVm,
    TrackingBagRepresentativePayloadVm,
    TrackingBagRepresentativeAwbResponseVm,
    TrackingBagRepresentativeAwbPayloadVm,
    TrackingBagRepresentativeDetailResponseVm,
    TrackingBagRepresentativeDetailPayloadVm,
    LogActivityPayloadVm,
    LogActivityResponseVm,
} from '../../../models/tracking.vm';
import { V1WebTrackingService } from '../../../services/web/v1/web-tracking.service';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { ActivityLogHelper } from '../../../../../shared/helpers/activity-log-helpers';

@ApiUseTags('Web Tracking')
@Controller('web/v1/tracking')
@ApiBearerAuth()
export class V1WebTrackingController {
  @Post('awbNumber')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: TrackingAwbResponseVm })
  public async awbNumber(@Body() payload: TrackingAwbPayloadVm) {
    return V1WebTrackingService.awb(payload);
  }

  @Post('bagNumber')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: TrackingBagResponseVm })
  public async bagNumber(@Body() payload: TrackingBagPayloadVm) {
    return V1WebTrackingService.bag(payload);
  }

  // TODO: to be removed
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

  @Post('bagRepresentative')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TrackingBagRepresentativeResponseVm })
  public async bagRepresentative(
    @Body() payload: TrackingBagRepresentativePayloadVm,
  ) {
    return V1WebTrackingService.bagRepresentative(payload);
  }

  @Post('awbPhoto')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbPhotoResponseVm })
  public async awbPhoto(@Body() payload: AwbPhotoDetailVm) {
    return V1WebTrackingService.awbPhotoDetail(payload);
  }

  @Post('bagRepresentativeAwb')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TrackingBagRepresentativeAwbResponseVm })
  public async bagRepresentativeAwb(
    @Body() payload: TrackingBagRepresentativeAwbPayloadVm,
  ) {
    return V1WebTrackingService.bagRepresentativeAwb(payload);
  }

  @Post('bagRepresentativeDetail')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TrackingBagRepresentativeDetailResponseVm })
  public async bagRepresentativeDetail(
    @Body() payload: TrackingBagRepresentativeDetailPayloadVm,
  ) {
    return V1WebTrackingService.bagRepresentativeDetail(payload);
  }

  @Post('logActivity')
  @HttpCode(HttpStatus.OK)
  public async bagRepresentativeDetail1(
    @Body() payload: any,
  ) {
    return ActivityLogHelper.logActivity(payload);
  }

  @Post('awbDetail')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LogActivityResponseVm })
  public async awbDetail(
    @Body() payload: LogActivityPayloadVm,
  ) {
    return V1WebTrackingService.awbDetail(payload);
  }
}
