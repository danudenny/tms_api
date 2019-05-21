import { Controller, Get, Query, Post, UseGuards, HttpCode } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BranchService } from '../../../../servers/main/services/master/branch.services';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';

@ApiUseTags('Master Data')
@Controller('api/data')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('branch')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  public async findAllBranch(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    return this.branchService.BranchFindAllResponseVm(page, take);
  }
}
