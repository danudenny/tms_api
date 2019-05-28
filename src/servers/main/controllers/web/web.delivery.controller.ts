// #region import
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { WebDeliveryService } from '../../services/web/delivery.service';
import { WebScanInAwbResponseVm, WebScanInBag1ResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebDeliveryListFilterPayloadVm } from '../../models/mobile-dashboard.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import moment = require('moment');
// #endregion

@ApiUseTags('Web Delivery')
@Controller('api/web/pod/scanIn')
export class WebDeliveryController {
  constructor(
    private readonly bagRepository: BagRepository,
    private readonly webDeliveryService: WebDeliveryService,
  ) { }

  @Post('awb')
  @Transactional()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInAwbResponseVm })
  public async scanIn(@Body() payload: WebScanInVm) {

    // TODO:
    // find awb where awb number get awb_id
    // find awb_item where awb_id get awb_item_id
    return this.webDeliveryService.scanInAwb(payload);
  }

  @Post('list')
  @ApiOkResponse({ type: WebScanInListResponseVm })
  public async findAllDeliveryList(@Body() payload: WebDeliveryListFilterPayloadVm) {

    return this.webDeliveryService.findAllDeliveryList(payload);
    }

  @Post('bag')
  @ApiOkResponse({ type: WebScanInBag1ResponseVm})
  public async Webbag(@Body() payload: WebScanInBagVm) {
    const dataItem = [];
    const result = new WebScanInBag1ResponseVm();
    let totalSuccess = 0;
    let totalError = 0;

    for (const bagNumber of payload.bagNumber) {
      const bag = await Bag.findOne({
        select: ['bagId', 'branchId'],
        where: { bagNumber },
      });

      if (bag) {
        const webbag = this.bagRepository.create();
        webbag.bagId = bag.bagId;
        webbag.branchId = bag.branchId;
        webbag.createdTime = moment().toDate();
        // webbag.createdTime = bag.createdTime;
        this.bagRepository.save(webbag);

        totalSuccess += 1;
        dataItem.push({
          bagNumber,
            status: 'ok',
            message: 'Success',
        });

      } else {
        totalError += 1;
        dataItem.push({
          bagNumber,
            status : 'error',
            message: 'Bag sudah Scan In pada Gerai X (20-05-2019 16:00:00)',
        });
      }
    }
    result.totalData = payload.bagNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
    }
  }
