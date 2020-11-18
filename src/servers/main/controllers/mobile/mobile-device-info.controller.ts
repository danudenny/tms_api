import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards} from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileDeviceInfoPayloadVm } from '../../models/mobile-device-info-payload.vm';
import { MobileDeviceInfoResponseVm } from '../../models/mobile-device-info.response.vm';
import {MobileDeviceInfoService} from '../../services/mobile/mobile-device-info.service';

@ApiUseTags('Mobile Device Info Detail')
@Controller('mobile/device/info')
export class MobileDeviceInfoController {
  constructor() {}

  @Post('save')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileDeviceInfoResponseVm })
  public async save(@Body() payload: MobileDeviceInfoPayloadVm) {
    return MobileDeviceInfoService.saveInfo(payload);
  }

}
