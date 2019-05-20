import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { awbRepository } from '../../../../shared/orm-repository/MobileDelivery.repository';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebScanInListResponseVm } from '../../models/WebScanInList.response.vm';
const logger = require('pino')();

@ApiUseTags('Scan In List')
@Controller('api/web/pod/scanIn/list')
export class WebDeliveryControllerList {
  constructor(
    private readonly awbRepository: awbRepository,
  ) { }

  @Post()
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
}
