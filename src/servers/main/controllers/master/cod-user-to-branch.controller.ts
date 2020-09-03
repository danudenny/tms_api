import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Param,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import {
  CodUserBranchAddResponseVm,
  CodUserBranchAddPayloadVm,
  CodUserBranchListtResponseVm,
  CodUserBranchRemovePayloadVm,
  CodUserBranchRemoveResponseVm,
} from '../../models/master/cod-user-to-branch.vm';
import { CodUserToBranchService } from '../../services/master/cod-user-to-branch.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Master Data')
@Controller('master/codUserBranch')
@ApiBearerAuth()
export class CodUserToBranchController {
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: CodUserBranchListtResponseVm })
  async findAll(@Body() payload: BaseMetaPayloadVm) {
    return CodUserToBranchService.findAll(payload);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: CodUserBranchAddResponseVm })
  async userBranchAdd(@Body() payload: CodUserBranchAddPayloadVm) {
    return CodUserToBranchService.add(payload);
  }

  @Post('remove')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: CodUserBranchRemoveResponseVm })
  async userBranchRemove(@Body() payload: CodUserBranchRemovePayloadVm) {
    return CodUserToBranchService.remove(payload);
  }
}
