import { Controller, Get } from '@nestjs/common';

import { ApiOkResponse } from '../../../shared/external/nestjs-swagger';
import { BranchRepository } from '../../../shared/orm-repository/branch.repository';
import { BranchVm } from '../models/branch.vm';

@Controller('branches')
export class BranchController {
  constructor(
    private readonly branchRepository: BranchRepository,
  ) {}

  @Get()
  @ApiOkResponse({ type: BranchVm })
  async findAllBranch() {
    const branches = await this.branchRepository.find();

    return branches;
  }
}
