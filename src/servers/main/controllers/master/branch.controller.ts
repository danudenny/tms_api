import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
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
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  public async findBranchName(@Body() payload: BaseMetaPayloadVm) {
    return this.branchService.findAllByRequest(payload);
  }

  @Post('list/cod')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: BranchFindAllResponseVm })
  public async findBranchNameCod(
    @Query() params: any,
    @Body() payload: BaseMetaPayloadVm,
  ) {
    return this.branchService.findAllByRequestCod(payload, Boolean(params.merger));
  }
}
