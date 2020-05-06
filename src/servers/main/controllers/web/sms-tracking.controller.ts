import {
  ApiUseTags,
  ApiBearerAuth,
  ApiOkResponse,
} from '../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body, Delete, Param } from '@nestjs/common';
import { SmsTrackingService } from '../../services/web/sms-tracking.service';
import {
  SmsTrackingStoreMessagePayloadVm,
  SmsTrackingListMessagePayloadVm,
  SmsTrackingStoreShiftPayloadVm,
  SmsTrackingListShiftPayloadVm,
  SmsTrackingListUserPayloadVm,
  SmsTrackingDeleteMessagePayloadVm,
  SmsTrackingUpdateMessagePayloadVm,
} from '../../models/sms-tracking-payload.vm';
import {
  SmsTrackingStoreMessageResponseVm,
  SmsTrackingListMessageResponseVm,
  SmsTrackingListShiftResponseVm,
  SmsTrackingStoreShiftResponseVm,
  SmsTrackingListUserResponseVm,
} from '../../models/sms-tracking-response.vm';

@ApiUseTags('Sms Tracking')
@Controller('sms-tracking')
export class SmsTrackingController {
  @Post('/message/store')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SmsTrackingStoreMessageResponseVm })
  public async messageStore(@Body() payload: SmsTrackingStoreMessagePayloadVm) {
    return SmsTrackingService.storeMessage(payload);
  }

  @Post('message/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SmsTrackingListMessageResponseVm })
  public async messageGetList(
    @Body() payload: SmsTrackingListMessagePayloadVm,
  ) {
    return SmsTrackingService.listMessage(payload);
  }

  @Post('message/update')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @ApiOkResponse({ type: SmsTrackingListMessageResponseVm })
  public async updateMessage(
    @Body() payload: SmsTrackingUpdateMessagePayloadVm,
  ) {
    return SmsTrackingService.updateMessage(payload);
  }

  @Post('delete-message')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @ApiOkResponse({ type: SmsTrackingListUserResponseVm })
  public async deleteMessage(@Body() payload: SmsTrackingDeleteMessagePayloadVm) {
    return SmsTrackingService.deleteMessage(payload);
  }

  @Post('shift/store')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SmsTrackingStoreShiftResponseVm })
  public async shiftStore(@Body() payload: SmsTrackingStoreShiftPayloadVm) {
    return SmsTrackingService.storeShift(payload);
  }

  @Post('shift/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SmsTrackingListShiftResponseVm })
  public async shiftList(@Body() payload: SmsTrackingListShiftPayloadVm) {
    return SmsTrackingService.listShift(payload);
  }

  @Post('user/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SmsTrackingListUserResponseVm })
  public async userList(@Body() payload: SmsTrackingListUserPayloadVm) {
    return SmsTrackingService.userList(payload);
  }
 
}
