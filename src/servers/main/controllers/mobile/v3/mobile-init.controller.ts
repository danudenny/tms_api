import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, BadRequestException } from '@nestjs/common';

import {
    ResponseSerializerOptions,
} from '../../../../../shared/decorators/response-serializer-options.decorator';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { MobileInitDataPayloadVm } from '../../../models/mobile-init-data-payload.vm';
import {
    MobileInitDataDeliveryV2ResponseVm, MobileInitDataResponseV2Vm,
} from '../../../models/mobile-init-data-response.vm';
import { V2MobileInitDataService } from '../../../services/mobile/v2/mobile-init-data.service';

@ApiUseTags('Mobile Init Data V3')
@Controller('mobile/v3')
export class V3MobileInitController {
  constructor() {}

  @Post('initData')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseV2Vm })
  public async initData(@Body() payload: MobileInitDataPayloadVm) {
    // NOTE: optimize query add response v2
    /*
      Still Utilize V2 Service
    */
    return V2MobileInitDataService.getInitDataByRequest(
      payload.lastSyncDateTime,
    );
  }
}
