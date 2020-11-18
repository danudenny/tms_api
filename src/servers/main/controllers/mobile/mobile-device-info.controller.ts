import {
    Param,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
  } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileDeviceInfoPayloadVm } from '../../models/mobile-device-info-payload.vm';
import {
  MobileDeviceInfoResponseVm,
  MobileDeviceInfoDetailResponseVm,
  ListMobileDeviceInfoResponseVm,
} from '../../models/mobile-device-info.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
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

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileDeviceInfoDetailResponseVm })
  public async getDetailInfo(@Param('userId') userId: number) {
    return MobileDeviceInfoService.getInfoById(userId);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ListMobileDeviceInfoResponseVm })
  public async getList(@Body() payload: BaseMetaPayloadVm) {
    return MobileDeviceInfoService.getList(payload);
  }

}
