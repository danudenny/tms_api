import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { WebScanInBranchVm, WebVerificationAwbVm, WebVerificationBagVm } from '../../models/web-scanin-branch.vm';
import { WebScanInBranchResponseVm, VerificationAwbResponseVm, WebScanInBranchResponseNewVm } from '../../models/web-scanin-branch.response.vm';
import { WebAwbCountService } from '../../services/web/web-awb-count.service';
import { WebScanInValidateBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInValidateBagVm } from '../../models/web-scanin-bag.vm';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Web Count Awb Pod')
@Controller('web/pod/count')
export class WebAwbCountController {
  @Post('awbCount')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBranchResponseVm })
  public async awbCount(@Body() payload: WebScanInBranchVm) {
    return WebAwbCountService.scanInBranch(payload);
  }

  @Post('bagValidate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInValidateBagResponseVm })
  public async bagValidate(@Body() payload: WebScanInValidateBagVm) {
    return WebAwbCountService.scanInValidateBag(payload);
  }

  @Post('bagVerification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: VerificationAwbResponseVm })
  public async bagVerify(@Body() payload: WebVerificationAwbVm) {
    return WebAwbCountService.verificationAwb(payload);
  }

  @Post('branchValidate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanInBranchResponseNewVm })
  public async branchValidate(@Body() payload: WebScanInBranchVm) {
    return WebAwbCountService.scanInValidateBranch(payload);
  }

  @Post('bagScanVerification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: VerificationAwbResponseVm })
  public async bagScanVerify(@Body() payload: WebVerificationBagVm) {
    return WebAwbCountService.verificationBag(payload);
  }
}
