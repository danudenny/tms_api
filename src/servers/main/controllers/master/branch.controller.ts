import { Controller, Get, Query, Post, UseGuards, HttpCode, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BranchService } from '../../../../servers/main/services/master/branch.services';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { BranchPayloadVm } from '../../models/branch.vm';
import { take } from 'rxjs/operators';

@ApiUseTags('Master Data')
@Controller('api/data')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('branch')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  public async findAllBranch(@Body() payload: BranchPayloadVm) {

    return this.branchService.findAllBranch(payload.page, payload.limit);
    }
  }
