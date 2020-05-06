import {
  ApiUseTags,
  ApiBearerAuth,
  ApiOkResponse,
} from '../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body, Delete, Param, Get, Response } from '@nestjs/common';
import { SmsTrackingService } from '../../services/web/sms-tracking.service';
import {
  SmsTrackingStoreMessagePayloadVm,
  SmsTrackingListMessagePayloadVm,
  SmsTrackingStoreShiftPayloadVm,
  SmsTrackingListShiftPayloadVm,
  SmsTrackingListUserPayloadVm,
  SmsTrackingDeleteUserPayloadVm,
  GenerateReportSmsTrackingPayloadVm,
} from '../../models/sms-tracking-payload.vm';
import {
  SmsTrackingStoreMessageResponseVm,
  SmsTrackingListMessageResponseVm,
  SmsTrackingListShiftResponseVm,
  SmsTrackingStoreShiftResponseVm,
  SmsTrackingListUserResponseVm,
} from '../../models/sms-tracking-response.vm';
import express = require('express');

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
  @Post('delete-user')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  // @ApiOkResponse({ type: SmsTrackingListUserResponseVm })
  public async deleteUser(@Body() payload: SmsTrackingDeleteUserPayloadVm) {
    return SmsTrackingService.deleteUser(payload);
  }

  @Get('export/excel')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @ApiOkResponse({ type: SmsTrackingListUserResponseVm })
  public async export(
    @Response() serverResponse: express.Response,
    @Body() payload: GenerateReportSmsTrackingPayloadVm,
  ) {
    return SmsTrackingService.export(serverResponse, payload);
  }
}
