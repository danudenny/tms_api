import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { WebScanInBranchVm, WebVerificationAwbVm } from '../../models/web-scanin-branch.vm';
import { WebScanInBranchResponseVm, VerificationAwbResponseVm } from '../../models/web-scanin-branch.response.vm';
import { WebAwbCountService } from '../../services/web/web-awb-count.service';
import { PermissionTokenGuard } from 'src/shared/guards/permission-token.guard';
import { WebScanInValidateBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInValidateBagVm } from '../../models/web-scanin-bag.vm';

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
}
