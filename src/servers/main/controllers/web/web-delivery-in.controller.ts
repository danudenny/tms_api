import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { WebScanInAwbResponseVm, WebScanInBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInListResponseVm, WebScanInBagListResponseVm, WebScanInBranchListResponseVm, WebScanInHubSortListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInVm, WebScanInBranchResponseVm, WebScanInValidateBranchVm, WebScanInBagBranchVm, WebScanInLoadBranchResponseVm, WebScanInBranchLoadResponseVm } from '../../models/web-scanin.vm';
import { WebDeliveryInService } from '../../services/web/web-delivery-in.service';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Web Delivery In')
@Controller('web/pod/scanIn')
export class WebDeliveryInController {
  constructor(
    private readonly bagRepository: BagRepository,
    private readonly webDeliveryService: WebDeliveryInService,
  ) {}

  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInAwbResponseVm })
  @Transactional()
  public async scanIn(@Body() payload: WebScanInVm) {
    return this.webDeliveryService.scanInAwb(payload);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllDeliveryList(@Body() payload: BaseMetaPayloadVm) {
    // TODO:
    return this.webDeliveryService.findAllAwbByRequest(payload);
  }

  @Post('bagList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBagListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBagList(@Body() payload: BaseMetaPayloadVm) {
    // TODO:
    return this.webDeliveryService.findAllBagByRequest(payload);
  }

  @Post('branchList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBranchListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBranchList(@Body() payload: BaseMetaPayloadVm) {
    // TODO:
    return this.webDeliveryService.findAllBranchInByRequest(payload);
  }

  @Post('hubSortList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllHubSortList(@Body() payload: BaseMetaPayloadVm) {
    // TODO:
    return this.webDeliveryService.findAllHubSortInByRequest(payload);
  }

  @Post('hubSortListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllHubSortListDetail(@Body() payload: BaseMetaPayloadVm) {
    // TODO:
    return this.webDeliveryService.findAllHubSortDetailByRequest(payload);
  }

  @Post('bagListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  // @ResponseSerializerOptions({ disable: true })
  public async findAllBagListDetail(@Body() payload: BaseMetaPayloadVm) {
    // TODO:
    return this.webDeliveryService.findAllBagDetailByRequest(payload);
  }

  @Post('bag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBagResponseVm })
  public async scanInBag(@Body() payload: WebScanInBagVm) {
    return this.webDeliveryService.scanInBag(payload);
  }

  @Post('dropoff')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBagResponseVm })
  public async scanInBagHub(@Body() payload: WebScanInBagVm) {
    return this.webDeliveryService.scanInBagHub(payload);
  }

  @Post('branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBranchResponseVm })
  public async scanInBranch(@Body() payload: WebScanInBagBranchVm) {
    return this.webDeliveryService.scanInBranch(payload);
  }

  @Post('validateBranch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  // @ApiOkResponse({ type: WebScanInBranchResponseVm })
  public async validateBranch(@Body() payload: WebScanInValidateBranchVm) {
    return this.webDeliveryService.scanInValidateBranch(payload);
  }

  @Post('loadBranch')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: WebScanInBranchLoadResponseVm })
  public async loadBranchPackage() {
    return this.webDeliveryService.loadBranchPackage();
  }

  @Post('dropOffList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  public async loadDropOffHubList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadDropOffList(payload);
  }

  @Post('dropOffListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async loadDropOffHubListDetail(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadDropOffListDetail(payload);
  }

  @Post('sortationHubList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInHubSortListResponseVm })
  public async loadSortationHubList(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadSortationList(payload);
  }

  @Post('sortationHubListDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDeliveryListResponseVm })
  public async loadSortationHubListDetail(@Body() payload: BaseMetaPayloadVm) {
    return this.webDeliveryService.loadSortationListDetail(payload);
  }
}
