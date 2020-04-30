import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { MobileKorwilService } from '../../services/mobile/mobile-korwil.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  BranchListKorwilResponseVm,
  MobileKorwilTransactionResponseVm,
  ItemListKorwilResponseVm,
  DetailPhotoKorwilResponseVm,
  MobileUpdateProcessKorwilResponseVm,
  KorwilHistoryResponseVm,
  DetailHistoryKorwilResponseVm,
} from '../../models/mobile-korwil-response.vm';
import {
  MobilePostKorwilTransactionPayloadVm,
  MobileUpdateProcessKorwilPayloadVm,
  MobileValidateCoordinateKorwilTransactionPayloadVm,
  KorwilHistoryPayloadVm,
} from '../../models/mobile-korwil-payload.vm';

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

  @Post('doneProcess')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileUpdateProcessKorwilResponseVm })
  public async updateDoneKorwil(
    @Body() payload: MobileUpdateProcessKorwilPayloadVm,
  ) {
    return MobileKorwilService.updateDoneKorwil(payload);
  }

  @Post('submitProcess')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileUpdateProcessKorwilResponseVm })
  public async updateSubmitProses(
    @Body() payload: MobileUpdateProcessKorwilPayloadVm,
  ) {
    return MobileKorwilService.updateSubmitKorwil(payload);
  }

  @Get('itemList/:branchId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ItemListKorwilResponseVm })
  public async itemList(@Param('branchId') branchId: string) {
    return MobileKorwilService.getItemList(branchId);
  }

  @Get('itemDetail/:korwilTransactionDetailId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: DetailPhotoKorwilResponseVm })
  public async itemDetail(
    @Param('korwilTransactionDetailId') korwilTransactionDetailId: string,
  ) {
    return MobileKorwilService.getDetailPhoto(korwilTransactionDetailId);
  }

  @Post('createItem')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileKorwilTransactionResponseVm })
  public async createItem(
    @Body() payload: MobilePostKorwilTransactionPayloadVm,
    @UploadedFiles() files,
  ) {
    return MobileKorwilService.updateTransaction(payload, files);
  }

  @Post('validate/coordinateBranch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileKorwilTransactionResponseVm })
  public async validateBranchByCoordinate(
    @Body() payload: MobileValidateCoordinateKorwilTransactionPayloadVm,
  ) {
    return MobileKorwilService.validateBranchCoordinate(payload);
  }

  @Post('history')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: KorwilHistoryResponseVm })
  public async getListTransactionHistory(
    @Body() payload: KorwilHistoryPayloadVm,
  ) {
    return MobileKorwilService.getListTransactionHistory(payload);
  }

  @Get('detailPDF/:korwilTransactionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: DetailHistoryKorwilResponseVm })
  public async detailPDF(
    @Param('korwilTransactionId') korwilTransactionId: string,
  ) {
    return MobileKorwilService.detailPDF(korwilTransactionId);
  }
}
