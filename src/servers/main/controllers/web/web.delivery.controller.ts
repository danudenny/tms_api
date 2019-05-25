import { Controller, Get, Query, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PodScanRepository } from '../../../../shared/orm-repository/pod-scan.repository';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInBagResponseVm } from '../../models/web-scanin.bag.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { Transactional } from 'src/shared/external/typeorm-transactional-cls-hooked';
import { Awb } from 'src/shared/orm-entity/awb';
import { WebDeliveryListService } from '../../services/web/web-delivery-list.service';
import moment = require('moment');
import { WebScanInAwbResponseVm, WebScanInBag1ResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebDeliveryFindAllResponseVm } from '../../models/web-delivery.response.vm';
import { DeliveryFilterPayloadVm, WebDeliveryListFilterPayloadVm } from '../../models/mobile-dashboard.vm';
import { Bag } from 'src/shared/orm-entity/bag';
import { BagRepository } from 'src/shared/orm-repository/bag.repository';
const logger = require('pino')();

@ApiUseTags('Mobile')
@Controller('api/web/pod/scanIn')
export class WebDeliveryController {
  constructor(
    private readonly podScanRepository: PodScanRepository,
    private readonly bagRepository: BagRepository,
    private readonly webDeliveryListService: WebDeliveryListService,
  ) { }

  @Post('awb')
  @Transactional()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanInAwbResponseVm })
  public async Web(@Body() payload: WebScanInVm) {

    // TODO:
    // find awb where awb number get awb_id
    // find awb_item where awb_id get awb_item_id

    const dataItem = [];
    const result = new WebScanInAwbResponseVm();
    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const awb = await Awb.findOne({
        select: ['awbId', 'branchId'],
        where: { awbNumber },
      });

      if (awb) {
        const podScan = this.podScanRepository.create();
        podScan.awbId = awb.awbId;
        podScan.awbItemId = 1;
        podScan.branchId = awb.branchId;
        podScan.doPodId = 1;
        podScan.userId = 15;
        podScan.podScaninDateTime = moment().toDate();
        this.podScanRepository.save(podScan);

        totalSuccess += 1;
        dataItem.push({
          awbNumber,
            status: 'ok',
            message: 'Success',
        });

      } else {
        totalError += 1;
        dataItem.push({
            awbNumber,
            status : 'error',
            message: 'Resi sudah Scan In pada Gerai X (20-05-2019 16:00:00)',
        });
      }
    } // end of loop

    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  @Post('list')
  @ApiOkResponse({ type: WebScanInListResponseVm })
  public async findAllDeliveryList(@Body() payload: WebDeliveryListFilterPayloadVm) {

    return this.webDeliveryListService.findAllDeliveryList(payload);
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
console.log(bag)
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


