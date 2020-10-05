import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
    WebHubScanOutBagResponseVm, WebScanOutCreateResponseVm, WebScanOutAwbResponseVm, WebHubScanOutAwbResponseVm,
} from '../../models/web-scan-out-response.vm';
import {
    TransferBagNumberHubVm, WebScanOutCreateVm, WebScanOutAwbVm, TransferAwbNumberHubVm,
} from '../../models/web-scan-out.vm';
import { HubTransitDeliveryService } from '../../services/web/hub-transit/hub-transit-delivery.service';
import { HubSortirService } from '../../services/web/hub-transit/hub-sortir.service';
import { WebScanInBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { HubTransitDeliveryInService } from '../../services/web/hub-transit/hub-transit-delivery-in.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebDropOffSummaryListResponseVm, WebScanInHubSortListResponseVm } from '../../models/web-scanin-list.response.vm';
import { HubTransitDeliveryOutService } from '../../services/web/hub-transit/hub-transit-delivery-out.service';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { HubMonitoringService } from '../../services/web/hub-transit/hub-monitoring.service';
import { MonitoringBagHubResponseVm, MonitoringBagHubTotalBagResponseVm } from '../../models/hub-monitoring.response.vm';

@ApiUseTags('Hub Delivery')
@Controller('pod/hub')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebHubController {
  constructor() {}

  @Post('scanOut/create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  public async scanOutCreate(@Body() payload: WebScanOutCreateVm) {
    return HubTransitDeliveryOutService.doPodAwbCreate(payload);
  }

  @Post('scanOut/awb')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  @Transactional()
  public async scanOutAwb(@Body() payload: WebScanOutAwbVm) {
    return HubTransitDeliveryOutService.scanOutAwb(payload);
  }

  @Post('dropoff')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInBagResponseVm })
  public async scanInBagHub(@Body() payload: WebScanInBagVm) {
    return HubTransitDeliveryInService.scanInBagHub(payload);
  }

  @Post('dropOffList')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  public async loadDropOffHubList(@Body() payload: BaseMetaPayloadVm) {
    return HubTransitDeliveryInService.getDropOffList(payload);
  }

  @Post('dropOffListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async loadDropOffHubListDetail(@Body() payload: BaseMetaPayloadVm) {
    return HubTransitDeliveryInService.getDropOffListDetail(payload);
  }

  @Post('dropOffSummaryList')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebDropOffSummaryListResponseVm })
  public async sumDropOffHubList(@Body() payload: BaseMetaPayloadVm) {
    return HubTransitDeliveryInService.getDropOffSummaryList(payload);
  }

  @Post('transfer/bagNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebHubScanOutBagResponseVm })
  public async transferAwbDelivery(@Body() payload: TransferBagNumberHubVm) {
    return HubTransitDeliveryService.transferBagNumber(payload);
  }
  @Post('sortir/awbNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebHubScanOutAwbResponseVm })
  public async sortirHub(@Body() payload: TransferAwbNumberHubVm) {
    return HubSortirService.hubAwbNumber(payload);
  }

  @Post('monitoring/bag')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringBagHubResponseVm })
  public async monitoringBagHub(@Body() payload: BaseMetaPayloadVm) {
    return HubMonitoringService.monitoringBagHub(payload);
  }
}
