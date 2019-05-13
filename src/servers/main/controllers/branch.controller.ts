import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse } from '../../../shared/external/nestjs-swagger';
import { BranchRepository } from '../../../shared/orm-repository/branch.repository';
import { BranchFindAllResponseVm } from '../models/branch.payload.vm';
import { toInteger } from 'lodash';
import { MetaService } from 'src/shared/services/meta.service';
const logger = require('pino')();

@Controller('branches')
export class BranchController {
  constructor(
    private readonly branchRepository: BranchRepository,
  ) {}

  @Get()
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  async findAllBranch(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip  = (page - 1) * take;
    const [data, total] = await this.branchRepository.findAndCount(
      {
        // where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
        cache: true,
        take,
        skip,
      },
    );
    const result = new BranchFindAllResponseVm();
    result.payload = data;
    result.meta = MetaService.set(page, take, total);

    logger.info(`Total data :: ${total}`);
    return result;
  }
}
