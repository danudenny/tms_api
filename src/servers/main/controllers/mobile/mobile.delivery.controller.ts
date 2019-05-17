import { Controller, Get, Query, Post, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { awbRepository } from '../../../../shared/orm-repository/MobileDelivery.repository';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { MobileDeliveryFindAllResponseVm } from '../../models/MobileDelivery.response.vm';
import { ObjectService } from 'src/shared/services/object.service';
const logger = require('pino')();

@ApiUseTags('Mobile Delivery')
@Controller('api/mobile/delivery')
export class MobileDeliveryController {
  constructor(
    private readonly AwbRepository: awbRepository,
  ) { }

  @Post()
  @ApiOkResponse({ type: MobileDeliveryFindAllResponseVm })
  async findAllBranch(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip = (page - 1) * take;
    const [data, total] = await this.AwbRepository.findAndCount(
      {
        // where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
        cache: true,
        take,
        skip,
      },
    );
    const result = new MobileDeliveryFindAllResponseVm();
    const createOrderPayload = ObjectService.transformToCamelCaseKeys(
      data,
      );
    Logger.log(data);
    Logger.log(createOrderPayload);
    result.data = [];
    result.paging = MetaService.set(page, take, total);

    logger.info(`Total data :: ${total}`);
    return result;
  }
}