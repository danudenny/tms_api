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
import { MobileSmdListService } from '../../services/integration/mobile-smd-list.service';
import { MobileSmdListVm, MobileSmdListDetailBagVm, MobileSmdListDetailBaggingVm, MobileSmdListDetailBagRepresentativeVm } from '../../models/mobile-smd-list.response.vm';
import { MobileSmdListDetailPayloadVm, MobileSmdListHistoryPayloadVm } from '../../models/mobile-smd.payload.vm';
import { WebScanInBagResponseVm } from '../../../main/models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../../main/models/web-scanin-bag.vm';
import { SmdHubService } from '../../services/integration/smd-hub.service';
import { WebScanInBaggingResponseVm, WebScanInBagRepresentativeResponseVm } from '../../models/scanin-hub-smd.response.vm';
import { WebScanInBaggingVm, WebScanInBagRepresentativeVm } from '../../models/scanin-hub-smd.payload.vm';

@ApiUseTags('SMD HUB')
@Controller('smd')
export class SmdHubController {
  constructor() {}

  @Post('dropoff')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInBagResponseVm })
  public async scanInBagHub(@Body() payload: WebScanInBagVm) {
    return SmdHubService.scanInBagHub(payload);
  }

  @Post('dropoff/bagging')
  @Transactional()
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInBaggingResponseVm })
  public async scanInBaggingHub(@Body() payload: WebScanInBaggingVm) {
    return SmdHubService.scanInBaggingHub(payload);
  }

  @Post('dropoff/bagRepresentative')
  @Transactional()
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInBagRepresentativeResponseVm })
  public async scanInBagRepresentativeHub(@Body() payload: WebScanInBagRepresentativeVm) {
    return SmdHubService.scanInBagRepresentativeHub(payload);
  }

}
