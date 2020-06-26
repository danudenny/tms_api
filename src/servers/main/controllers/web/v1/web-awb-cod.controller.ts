import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { V1WebAwbCodService } from '../../../services/web/v1/web-awb-cod.service';
import { WebAwbCodListResponseVm, WebCodTransferBranchResponseVm, WebAwbCodListTransactionResponseVm } from '../../../models/cod/web-awb-cod-response.vm';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { WebCodTransferPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';

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
  @ApiOkResponse({ type: WebAwbCodListResponseVm })
  public async transactionBranchDetail(@Param('id') transactionId: string) {
    // get data transaction branch detail
    // awb number | method | penerima | nilai cod
    return {};
  }

  // @Post('transferHeadOffice')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ApiOkResponse({ type: WebAwbCodListResponseVm })
  // public async transferHeadOffice(payload: BaseMetaPayloadVm) {
  //   // TODO:
  //   return {};
  // }
}
