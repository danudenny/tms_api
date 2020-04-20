import {
  ApiUseTags,
  ApiBearerAuth,
  ApiOkResponse,
} from '../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { SmsTrackingService } from '../../services/web/sms-tracking.service';
import {
  SmsTrackingStorePayloadVm,
  SmsTrackingListPayloadVm,
} from '../../models/sms-tracking-payload.vm';
import {
  SmsTrackingStoreResponseVm,
  SmsTrackingListResponseVm,
} from '../../models/sms-tracking-response.vm';

@ApiUseTags('Sms Tracking')
@Controller('web/sms/tracking')
export class SmsTrackingController {
  @Post('save')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SmsTrackingStoreResponseVm })
  public async awbNumber(@Body() payload: SmsTrackingStorePayloadVm) {
    return SmsTrackingService.save(payload);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SmsTrackingListResponseVm })
  public async bagNumber(@Body() payload: SmsTrackingListPayloadVm) {
    return SmsTrackingService.list(payload);
  }
}
