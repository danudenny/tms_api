import { Body, Controller, Post, Req, UseGuards, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdSealPayloadVm, ScanOutSmdHandoverPayloadVm, ScanOutSmdDetailPayloadVm } from '../../models/scanout-smd.payload.vm';
import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { MobileInitDataResponseVm } from '../../../main/models/mobile-init-data-response.vm';
import { MobileInitDataPayloadVm } from '../../../main/models/mobile-init-data-payload.vm';
import { MobileSmdService } from '../../services/integration/mobile-smd.service';

@ApiUseTags('SCAN OUT SMD')
@Controller('smd')
export class MobileSmdController {
  constructor() {}

  @Post('getHistory')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async getHistory(@Body() payload: MobileInitDataPayloadVm) {
    return MobileSmdService.getHistoryByRequest(
      payload.doPodDeliverDetailId,
    );
  }

  @Post('mobile/list')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutVehicle(@Req() request: any, @Body() payload: ScanOutSmdVehiclePayloadVm) {
    return ScanoutSmdService.scanOutVehicle(payload);
  }

}
