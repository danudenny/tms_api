import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { MobileKorwilService } from '../../services/mobile/mobile-korwil.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BranchListKorwilResponseVm, MobilePostKorwilTransactionResponseVm, ItemListKorwilResponseVm } from '../../models/mobile-korwil-response.vm';
import { MobilePostKorwilTransactionPayloadVm, MobileKorwilListItemPayloadVm } from '../../models/mobile-korwil-payload.vm';

@ApiUseTags('Korwil')
@Controller('mobile/korwil')
export class MobileKorwilController {
  constructor() {}

  @Get('branchList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BranchListKorwilResponseVm })
  public async branchList() {
    return MobileKorwilService.getBranchList();
  }

  @Get('itemList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({})
  public async itemList(@Body() payload: MobileKorwilListItemPayloadVm) {
    return MobileKorwilService.getItemList(payload);
  }
}
