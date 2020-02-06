import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ResponseSerializerOptions } from '../../../../../shared/decorators/response-serializer-options.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { MobileInitDataPayloadVm } from '../../../models/mobile-init-data-payload.vm';
import { MobileInitDataResponseVm } from '../../../models/mobile-init-data-response.vm';
import { V1MobileInitDataService } from '../../../services/mobile/v1/mobile-init-data.service';

@ApiUseTags('Mobile Init Data')
@Controller('mobile/v1')
export class V1MobileInitController {
  constructor() {}

  @Post('initData')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async initData(@Body() payload: MobileInitDataPayloadVm) {
    return V1MobileInitDataService.getInitDataByRequest(payload.lastSyncDateTime);
  }

  @Post('getHistory')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async getHistory(@Body() payload: MobileInitDataPayloadVm) {
    return V1MobileInitDataService.getHistoryByRequest(
      payload.doPodDeliverDetailId,
    );
    return null;
  }
}
