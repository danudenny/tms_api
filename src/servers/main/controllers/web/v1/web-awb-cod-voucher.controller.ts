// #region import
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthKeyCodGuard } from '../../../../../shared/guards/auth-key-cod.guard';
import {
    WebCodTransferHeadOfficePayloadVm, WebCodTransferPayloadVm, WebCodVoucherPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebCodTransferBranchResponseVm, WebCodTransferHeadOfficeResponseVm,
    WebCodVoucherSuccessResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { V1WebAwbCodVoucherService } from '../../../services/web/v1/web-awb-cod-voucher.service';

// #endregion import

@ApiUseTags('Voucher Awb COD')
@Controller('v1/cod')
export class V1WebAwbCodVoucherController {
  @Post('divaSettlement')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebCodVoucherSuccessResponseVm })
  public async divaSettlement(
    @Req() request: any,
    @Body() payload: WebCodVoucherPayloadVm,
  ) {
    const authKey = request.headers['auth-key'];
    let result = {};
    if (authKey && authKey !== '5a71a345b4eaa9d23b4d4c745e7785e9') {
      result = {
        code: '422',
        message: 'Invalid API KEY',
      };
      return result;
    }

    return V1WebAwbCodVoucherService.divaSettlement(payload);
  }

  @Get('vouchers')
  @HttpCode(HttpStatus.OK)
  public async vouchers() {
    return V1WebAwbCodVoucherService.getAllVouchers();
  }

  // NOTE: only use for migratin data
  // #region migration data
  @Post('migration/transaction')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  // @ApiOkResponse({ type: WebCodTransferBranchResponseVm })
  public async migrationTransaction(@Body() payload: WebCodTransferPayloadVm) {
    return {}; // V1WebAwbCodService.transferBranch(payload);
  }

  @Post('migration/bankStatement')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  // @ApiOkResponse({ type: WebCodTransferHeadOfficeResponseVm })
  public async migrationBankStatement(
    @Body() payload: WebCodTransferHeadOfficePayloadVm,
  ) {
    return {}; // V1WebAwbCodService.transferHeadOffice(payload, file);
  }

  @Post('migration/supplierInvoice')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  // @ApiOkResponse({ type: WebCodTransferHeadOfficeResponseVm })
  public async migrationSupplierInvoice(
    @Body() payload: WebCodTransferHeadOfficePayloadVm,
  ) {
    return {}; // V1WebAwbCodService.transferHeadOffice(payload, file);
  }
  // #endregion migration data
}
