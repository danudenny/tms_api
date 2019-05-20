import { Controller, Get, Query, Injectable } from '@nestjs/common';
// import { ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger } from 'lodash';
import { Branch } from '../../../../shared/orm-entity/branch';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaService } from 'src/shared/services/meta.service';
import { BranchRepository } from 'src/shared/orm-repository/branch.repository';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: BranchRepository,
  ) {}

  async BranchFindAllResponseVm(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip = (page - 1) * take;
    const [data, total] = await Branch.findAndCount(
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

