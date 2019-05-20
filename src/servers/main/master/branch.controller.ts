import { Controller, Get, Query, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { branchService } from '../../../servers/main/services/master/branch.services';
import { BranchFindAllResponseVm } from '../models/branch.response.vm';


@ApiUseTags('Master Data')
@Controller('dropdown')
export class BranchController {
  constructor(
    private readonly branchService: branchService,
  ) {}

  @Post('branches')
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  public async findAllBranch(@Query('page') page: number,@Query('limit') take: number,
  ) {
    return this.branchService.BranchFindAllResponseVm(page, take);
  }
}