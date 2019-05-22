import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebScanInVm } from '../../models/WebScanIn.vm';
import { WebScanInFindAllResponseVm } from '../../models/WebScanIn.response.vm';
import { WebScanInListResponseVm } from '../../models/WebScanInList.response.vm';
import { WebScanInBagResponseVm } from '../../models/WebScanIn.bag.response.vm';
import { WebScanInBagVm } from '../../models/WebScanInBag.vm';
const logger = require('pino')();

@ApiUseTags('Mobile')
@Controller('api/web/pod/scanIn')
export class WebDeliveryController {
  constructor(
    private readonly awbRepository: AwbRepository,
  ) { }

  @Post('awb')
  @ApiOkResponse({ type: WebScanInFindAllResponseVm })
  public async Web(@Body() payload: WebScanInVm) {

    // TODO: looping awb number
    // find on table awb where awb_number
    // get awb_id,
    // find on table awb_item where awb_id
    // get awb_id

    const Web = await this.awbRepository.create(
      // payload.clientId,
    );

    return Web;
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
    const [data, total] = await this.awbRepository.findAndCount(
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
    const Web = await this.awbRepository.create(
      // payload.clientId,
    );

    return Web;
  }
}

