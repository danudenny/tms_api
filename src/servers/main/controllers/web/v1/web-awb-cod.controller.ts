import {
    Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
    WebCodTransferHeadOfficePayloadVm, WebCodTransferPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebAwbCodListResponseVm, WebAwbCodListTransactionResponseVm, WebCodTransactionDetailResponseVm,
    WebCodTransferBranchResponseVm, WebCodTransferHeadOfficeResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { V1WebAwbCodService } from '../../../services/web/v1/web-awb-cod.service';

@ApiUseTags('Web Awb COD')
@Controller('web/v1/cod')
@ApiBearerAuth()
export class V1WebAwbCodController {
  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodListResponseVm })
  public async awb(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbCodService.awbCod(payload);
  }

  @Post('transferBranch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodTransferBranchResponseVm })
  public async transferBranch(@Body() payload: WebCodTransferPayloadVm) {
    return V1WebAwbCodService.transferBranch(payload);
  }

  @Post('transactionBranch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodListTransactionResponseVm })
  public async transactionBranch(@Body() payload: BaseMetaPayloadVm) {
    // get data transaction branch
    return V1WebAwbCodService.transactionBranch(payload);
  }

  @Get('transactionBranch/detail/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodTransactionDetailResponseVm })
  public async transactionBranchDetail(@Param('id') transactionId: string) {
    // get data transaction branch detail
    return V1WebAwbCodService.transactionBranchDetail(transactionId);
  }

  // form multipart
  @Post('transferHeadOffice')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodTransferHeadOfficeResponseVm })
  public async deliveryOrderCreate(
    @Body() payload: WebCodTransferHeadOfficePayloadVm,
    @UploadedFile() file,
  ) {
    return V1WebAwbCodService.transferHeadOffice(payload, file);
  }
}
