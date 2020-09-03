import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { CodUserBranchAddResponseVm, CodUserBranchAddPayloadVm } from '../../models/master/cod-user-to-branch.vm';
import { CodUserToBranchService } from '../../services/master/cod-user-to-branch.service';

@ApiUseTags('Master Data')
@Controller('master/codUserBranch')
@ApiBearerAuth()
export class CodUserToBranchController {
  @Post('add')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: CodUserBranchAddResponseVm })
  async userBranchAdd(@Body() payload: CodUserBranchAddPayloadVm) {
    return CodUserToBranchService.userBranchAdd(payload);
  }

  // @Post('remove')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: RolePermissionUpdateResponseVm })
  // async userBranchRemove(@Body() payload: RolePermissionUpdatePayloadVm) {
  //   return CodUserToBranchService.userBranchRemove(payload);
  // }
}
