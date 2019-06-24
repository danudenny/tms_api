import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BranchService } from '../../services/master/branch.service';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BranchPayloadVm } from '../../models/branch.vm';

@ApiUseTags('Master Data')
@Controller('master/branch')
export class BranchController {
  constructor(
    private readonly branchService: BranchService,
  ) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  public async findBranchName(@Body() payload: BranchPayloadVm) {

    return this.branchService.findBranchName(payload);
  }
}
