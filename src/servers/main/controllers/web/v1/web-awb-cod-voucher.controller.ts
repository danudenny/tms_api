// #region import
import {
  Body, Controller, Post, Req, HttpCode, HttpStatus, Get,
} from '@nestjs/common';
import { ApiUseTags, ApiOkResponse } from '../../../../../shared/external/nestjs-swagger';
import { WebCodVoucherPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import { WebCodVoucherSuccessResponseVm } from '../../../models/cod/web-awb-cod-response.vm';
import { V1WebAwbCodVoucherService } from '../../../services/web/v1/web-awb-cod-voucher.service';

// #endregion import

@ApiUseTags('Web Awb COD')
@Controller('web/v1/cod')
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
}
