import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { BranchRepository } from '../../../shared/orm-repository/branch.repository';
import { BranchFindAllResponseVm } from '../models/branch.response.vm';
import { toInteger } from 'lodash';
import { MetaService } from '../../../shared/services/meta.service';

@ApiUseTags('Master Data')
@Controller('dropdown')
export class BranchController {
  constructor(
    private readonly branchRepository: BranchRepository,
  ) {}

  @Post('branches')
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
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
