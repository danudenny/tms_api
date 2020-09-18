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
import { WebScanInBaggingResponseVm, WebScanInBagRepresentativeResponseVm, WebScanInHubBagRepresentativeSortListResponseVm, WebScanInHubBagRepresentativeDetailSortListResponseVm, SmdHubBaggingListResponseVm, SmdHubBaggingDetailResponseVm } from '../../models/scanin-hub-smd.response.vm';
import { WebScanInBaggingVm, WebScanInBagRepresentativeVm } from '../../models/scanin-hub-smd.payload.vm';
import { SmdHubDropOffGabPaketListResponseVm, SmdHubDropOffGabPaketAwbListResponseVm } from '../../models/smd-hub-drop-off-bagging.response.vm';

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

  @Post('dropOffList/bagRepresentative')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInHubBagRepresentativeSortListResponseVm })
  public async loadDropOffHubList(@Body() payload: BaseMetaPayloadVm) {
    return SmdHubService.getDropOffBagRepresentativeList(payload);
  }

  @Post('dropOffListDetail/bagRepresentative')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInHubBagRepresentativeDetailSortListResponseVm })
  public async loadDropOffHubListDetail(@Body() payload: BaseMetaPayloadVm) {
    return SmdHubService.getDropOffBagRepresentativeDetailList(payload);
  }

  @Post('dropOffList/bagging')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SmdHubBaggingListResponseVm })
  public async loadDropOffListBagging(@Body() payload: BaseMetaPayloadVm) {
    return SmdHubService.getDropOffListBagging(payload);
  }

  @Post('dropOffListDetail/bagging')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SmdHubBaggingDetailResponseVm })
  public async loadDropOffHubBaggingListDetail(@Body() payload: BaseMetaPayloadVm) {
    return SmdHubService.getDropOffHubBaggingListDetail(payload);
  }

  @Post('dropOffList/bagging/list')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SmdHubDropOffGabPaketListResponseVm })
  public async getDropOffListGabPaketList(@Body() payload: BaseMetaPayloadVm) {
    return SmdHubService.getDropOffListGabPaketList(payload);
  }

  @Post('dropOffList/bagging/awb/list')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SmdHubDropOffGabPaketAwbListResponseVm })
  public async getDropOffListGabPaketAwbList(@Body() payload: BaseMetaPayloadVm) {
    return SmdHubService.getDropOffListGabPaketAwbList(payload);
  }
}
