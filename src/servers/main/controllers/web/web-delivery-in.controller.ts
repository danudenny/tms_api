import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { WebDeliveryListFilterPayloadVm } from '../../models/web-delivery-payload.vm';
import { WebScanInAwbResponseVm, WebScanInBag1ResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { WebDeliveryInService } from '../../services/web/web-delivery-in.service';

// #region import
// #endregion

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
  public async findAllDeliveryList(
    @Body() payload: WebDeliveryListFilterPayloadVm,
  ) {
    // TODO:
    return this.webDeliveryService.findAllDeliveryList(payload);
  }

  @Post('bag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBag1ResponseVm })
  public async findAllBag(@Body() payload: WebScanInBagVm) {
    return this.webDeliveryService.findAllBag(payload);
  }
}
