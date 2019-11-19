import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { BranchService } from '../../services/master/branch.service';

@ApiUseTags('Master Data')
@Controller('master/branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  public async findBranchName(@Body() payload: BaseMetaPayloadVm) {
    return this.branchService.findAllByRequest(payload);
  }
}
