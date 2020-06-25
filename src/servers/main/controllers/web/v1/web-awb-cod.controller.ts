import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { V1WebAwbCodService } from '../../../services/web/v1/web-awb-cod.service';
import { WebAwbCodListResponseVm, WebCodTransferBranchResponseVM } from '../../../models/cod/web-awb-cod-response.vm';
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
  @ApiOkResponse({ type: WebCodTransferBranchResponseVM })
  public async transferBranch(@Body() payload: WebCodTransferPayloadVm) {
    return V1WebAwbCodService.transferBranch(payload);
  }

  // @Post('transactionBranch')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebAwbCodListResponseVm })
  // public async transactionBranch(payload: BaseMetaPayloadVm) {
  //   // get data transaction branch
  //   // transaction code |datetime | total awb | total value | branch name last | status ? | user
  //   return {};
  // }

  // @Post('detailAwbBranch')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebAwbCodListResponseVm })
  // public async detailAwbBranch(payload: BaseMetaPayloadVm) {
  //   // get data detail
  //   // penerima | layanan | branch name last | cod_value | sigesit | status
  //   return {};
  // }

  // @Post('transferHeadOffice')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ApiOkResponse({ type: WebAwbCodListResponseVm })
  // public async transferHeadOffice(payload: BaseMetaPayloadVm) {
  //   // TODO:

  //   return {};
  // }
}
