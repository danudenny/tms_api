import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { MobileKorwilService } from '../../services/mobile/mobile-korwil.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BranchListKorwilResponseVm, MobilePostKorwilTransactionResponseVm, ItemListKorwilResponseVm } from '../../models/mobile-korwil-response.vm';
import { MobilePostKorwilTransactionPayloadVm } from '../../models/mobile-korwil-payload.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';

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

  @Get('itemList/:branchId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: ItemListKorwilResponseVm })
  public async itemList(
    @Param('branchId') branchId: string,
  ) {
    return MobileKorwilService.getItemList(branchId);
  }

  @Post('createItem')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobilePostKorwilTransactionResponseVm })
  public async checkInForm(
    @Body() payload: MobilePostKorwilTransactionPayloadVm,
    @UploadedFile() file,
  ) {
    return MobileKorwilService.createTransaction(payload, file);
  }


}
