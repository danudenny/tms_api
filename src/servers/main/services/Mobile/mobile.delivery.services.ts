import { Injectable,  Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Awb } from '../../../../shared/orm-entity/awb';
import { toInteger } from 'lodash';
import { MobileDeliveryFindAllResponseVm } from '../../models/MobileDelivery.response.vm';
import { ObjectService } from 'src/shared/services/object.service';
import { MetaService } from 'src/shared/services/meta.service';
import { awbRepository } from 'src/shared/orm-repository/MobileDelivery.repository';
const logger = require('pino')();

@Injectable()
export class mobiledeliveryService {
  constructor(
    @InjectRepository(Awb)
    private AwbRepository: Repository<Awb>,
  ) {}

  async findAllMobileDelivery(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip = (page - 1) * take;
    const [data, total] = await Awb.findAndCount(
      {
        // where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
        cache: true,
        take,
        skip,
      },
    );
    const result = new MobileDeliveryFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);

    logger.info(`Total data :: ${total}`);
    return result;
}
}