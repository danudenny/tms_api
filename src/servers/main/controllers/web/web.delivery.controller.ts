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
import moment = require('moment');
const logger = require('pino')();

@ApiUseTags('Mobile')
@Controller('api/web/pod/scanIn')
export class WebDeliveryController {
  constructor(
    private readonly podScanRepository: PodScanRepository,
  ) { }

  @Post('awb')
  @Transactional()
  @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: WebScanInFindAllResponseVm })
  public async Web(@Body() payload: WebScanInVm) {

    // TODO:
    // find awb where awb number get awb_id
    // find awb_item where awb_id get awb_item_id
    let item;
    for(item in payload.awbNumber) {
      let awb = await Awb.find({
        select: ["awbId", "branchId"],
        where: { awbNumber: payload.awbNumber[item] }
      })

    if (awb) {
      const Web = this.podScanRepository.create();
      Web.awbId = awb[0]['awbId'];
      Web.awbItemId = 1;
      Web.branchId= awb[0]['branchId'];
      Web.doPodId= 1;
      Web.userId= 15;
      Web.podScaninDateTime = moment().toDate();
      this.podScanRepository.save(Web);
    }

    logger.info(awb[0]['awbId'])
    } //end of loop

    return {};
  }

  @Post('list')
  @ApiOkResponse({ type: WebScanInListResponseVm })
  async findAllWebDeliveryControllerList(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip = (page - 1) * take;
    const [data, total] = await this.podScanRepository.findAndCount(
      {
        // where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
        cache: true,
        take,
        skip,
      },
    );
    const result = new WebScanInListResponseVm();
    result.data = [];
    result.paging = MetaService.set(page, take, total);

    logger.info(`Total data :: ${total}`);
    return result;
  }

  @Post('bag')
  @ApiOkResponse({ type: WebScanInBagResponseVm})
  public async Webbag(@Body() payload: WebScanInBagVm) {
    const Web = await this.podScanRepository.create(
      // payload.clientId,
    );

    return Web;
  }
}

