import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BranchListKorwilResponseVm, MobilePostKorwilTransactionPayloadVm } from '../../models/mobile-korwil-response.vm';
import { MobileKorwilService } from '../../services/mobile/mobile-korwil.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Korwil')
@Controller('mobile/korwil')
export class MobileKorwilController {
  constructor() {}

  @Get('branchList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BranchListKorwilResponseVm })
  public async dashboard() {
    return MobileKorwilService.getBranchList();
  }
}
