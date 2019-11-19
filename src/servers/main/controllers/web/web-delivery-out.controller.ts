// #region import
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { WebDeliveryOutService } from '../../services/web/web-delivery-out.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  WebScanOutAwbVm,
  WebScanOutCreateVm,
  WebScanOutAwbListPayloadVm,
  WebScanOutCreateDeliveryVm,
  WebScanOutBagVm,
  WebScanOutAwbValidateVm,
  WebScanOutEditVm,
  WebScanOutEditHubVm,
  WebScanOutBagValidateVm,
  WebScanOutLoadForEditVm,
  WebScanOutBagForPrintVm,
  WebScanOutDeliverEditVm,
} from '../../models/web-scan-out.vm';
import {
  WebScanOutAwbResponseVm,
  WebScanOutCreateResponseVm,
  WebScanOutAwbListResponseVm,
  WebScanOutDeliverListResponseVm,
  WebScanOutBagResponseVm,
  ScanAwbVm,
  ScanBagVm,
  WebScanOutResponseForEditVm,
  WebScanOutResponseForPrintVm,
} from '../../models/web-scan-out-response.vm';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BagOrderResponseVm, BagDetailResponseVm, PhotoResponseVm, BagDeliveryDetailResponseVm} from '../../models/bag-order-detail-response.vm';
import { BagAwbVm, BagDetailVm, PhotoDetailVm, BagDeliveryDetailVm } from '../../models/bag-order-response.vm';
import { LastMileDeliveryOutService } from '../../services/web/last-mile/last-mile-delivery-out.service';
// #endregion

@ApiUseTags('Web Delivery Out')
@Controller('web/pod/scanOut')
export class WebDeliveryOutController {
  constructor(private readonly webDeliveryOutService: WebDeliveryOutService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  @Transactional()
  public async scanOutCreate(@Body() payload: WebScanOutCreateVm) {
    return this.webDeliveryOutService.scanOutCreate(payload);
  }

  @Post('updateAwb')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  @Transactional()
  public async scanOutUpdateAwb(@Body() payload: WebScanOutEditVm) {
    return this.webDeliveryOutService.scanOutUpdateAwb(payload);
  }

  @Post('updateBag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  @Transactional()
  public async scanOutUpdateBag(@Body() payload: WebScanOutEditHubVm) {
    return this.webDeliveryOutService.scanOutUpdateBag(payload);
  }

  @Post('createDeliver')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  @Transactional()
  public async scanOutCreateDelivery(
    @Body() payload: WebScanOutCreateDeliveryVm,
  ) {
    return LastMileDeliveryOutService.scanOutCreateDelivery(payload);
  }

  @Post('updateDeliver')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  @Transactional()
  public async scanOutUpdateDeliver(@Body() payload: WebScanOutDeliverEditVm) {
    return LastMileDeliveryOutService.scanOutUpdateDelivery(payload);
  }

  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  @Transactional()
  public async scanOutAwb(@Body() payload: WebScanOutAwbVm) {
    // NOTE: Scan Out With Awb
    // 1. Criss Cross
    // 2. Transit
    return this.webDeliveryOutService.scanOutAwb(payload);
  }

  @Post('awbDeliver')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  @Transactional()
  public async scanOutAwbDeliver(@Body() payload: WebScanOutAwbVm) {
    // Antar (Sigesit)
    return LastMileDeliveryOutService.scanOutAwbDeliver(payload);
  }

  @Post('bag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutBagResponseVm })
  public async findAllBag(@Body() payload: WebScanOutBagVm) {
    // TODO: open bag and loop awb for update awb history
    return this.webDeliveryOutService.scanOutBag(payload);
  }

  @Post('awbList')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutAwbListResponseVm })
  public async awbList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryOutService.findAllScanOutList(payload);
  }

  @Post('deliverList')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutDeliverListResponseVm })
  public async deliverList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryOutService.findAllScanOutDeliverList(payload);
  }

  @Post('awbValidate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ScanAwbVm })
  public async awbValidate(@Body() payload: WebScanOutAwbValidateVm) {
    return this.webDeliveryOutService.scanOutAwbValidate(payload);
  }

  @Post('bagValidate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ScanBagVm })
  public async bagValidate(@Body() payload: WebScanOutBagValidateVm) {
    return this.webDeliveryOutService.scanOutBagValidate(payload);
  }

  @Post('bagList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutAwbListResponseVm })
  public async bagList(@Body() payload: WebScanOutAwbListPayloadVm) {
    // TODO: add filter by doPodType (Transit HUB)
    return this.webDeliveryOutService.findAllScanOutList(payload, true);
  }

  @Post('hubTransitList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutAwbListResponseVm })
  public async hubTransitList(@Body() payload: WebScanOutAwbListPayloadVm) {
    // TODO: add filter by doPodType (Transit HUB)
    return this.webDeliveryOutService.findAllScanOutList(payload, false, true);
  }

  @Post('branchList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutAwbListResponseVm })
  public async branchList(@Body() payload: WebScanOutAwbListPayloadVm) {
    // TODO: add filter by doPodType (Transit HUB)
    return this.webDeliveryOutService.findAllScanOutList(payload);
  }

  @Post('awbDeliveryOrder')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async awbDeliveryOrder(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryOutService.awbDetailDelivery(payload);
  }

  @Post('deliveryOrderDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async deliveryOrderDetail(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryOutService.detailDelivery(payload);
  }

  @Post('bagDeliveryOrder')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async bagDeliveryOrder(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryOutService.bagDetailDelivery(payload);
  }

  @Post('awbLoadForEdit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutResponseForEditVm })
  public async scanOutAwbLoadForEdit(@Body() payload: WebScanOutLoadForEditVm) {
    return this.webDeliveryOutService.scanOutLoadForEdit(payload);
  }

  @Post('bagLoadForEdit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutResponseForEditVm })
  public async scanOutBagLoadForEdit(@Body() payload: WebScanOutLoadForEditVm) {
    return this.webDeliveryOutService.scanOutLoadForEdit(payload, true);
  }

  @Post('awbDeliverLoadForEdit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutResponseForEditVm })
  public async scanOutAwbDeliverLoadForEdit(
    @Body() payload: WebScanOutLoadForEditVm,
  ) {
    return LastMileDeliveryOutService.scanOutDeliverLoadForEdit(payload);
  }

  @Post('bagItemForPrint')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanOutResponseForPrintVm })
  public async scanOutBagItemForPrint(
    @Body() payload: WebScanOutBagForPrintVm,
  ) {
    return this.webDeliveryOutService.getBagItemId(payload);
  }

  @Post('bagOrderDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BagOrderResponseVm })
  public async bagOrderDetail(@Body() payload: BagAwbVm) {
    return this.webDeliveryOutService.bagOrderDetail(payload);
  }

  @Post('doPodDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BagDetailResponseVm })
  public async doPodDetail(@Body() payload: BagDetailVm) {
    return this.webDeliveryOutService.doPodDetail(payload);
  }

  @Post('doPodDeliverDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BagDeliveryDetailResponseVm })
  public async doPodDeliverDetail(@Body() payload: BagDeliveryDetailVm) {
    return this.webDeliveryOutService.doPodDeliveryDetail(payload);
  }

  @Post('photoDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PhotoResponseVm })
  public async photoDetail(@Body() payload: PhotoDetailVm) {
    return this.webDeliveryOutService.photoDetail(payload);
  }
}