// #region import
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { WebDeliveryService } from '../../services/web/delivery.service';
import { WebScanInAwbResponseVm, WebScanInBag1ResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebDeliveryListFilterPayloadVm } from '../../models/web-delivery-payload.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import moment from 'moment';
// #endregion

@ApiUseTags('Web Delivery Out')
@Controller('api/web/pod/scanOut')

export class WebDeliveryOutController {
  constructor(
    private readonly webDeliveryService: WebDeliveryService,
  ) { }

  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInAwbResponseVm })
  @Transactional()
  public async scanIn(@Body() payload: WebScanInVm) {
    // TODO: ??
    return null; // this.webDeliveryService.scanInAwb(payload);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInListResponseVm })
  public async findAllDeliveryList(@Body() payload: WebDeliveryListFilterPayloadVm) {
    // TODO: ??
    return null; // this.webDeliveryService.findAllDeliveryList(payload);
  }

  @Post('bag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBag1ResponseVm})
  public async findAllBag(@Body() payload: WebScanInBagVm) {
    // TODO: ??
    return null; // this.webDeliveryService.findAllBag(payload);
    }

}
