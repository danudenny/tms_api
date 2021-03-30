import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebAwbReturnGetAwbPayloadVm, WebAwbReturnGetAwbResponseVm, WebAwbReturnCreatePayload, WebAwbReturnCreateResponse } from '../../models/web-awb-return.vm';
import { WebAwbReturnService } from '../../services/web/web-awb-return.service';
import { WebReturListResponseVm } from '../../models/web-retur-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebReturUpdateListPayloadVm} from '../../models/web-retur-update-response.vm';
import { WebReturUpdateResponseVm } from '../../models/web-retur-update-list-response.vm';
import { WebReturHistoryFindAllResponseVm } from '../../models/web-retur-history.response.vm';
import { WebReturHistoryPayloadVm } from '../../models/web-retur-history-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
// NOTE: PENDING TASK ==========================================================
// ================================================================
@ApiUseTags('Web Awb Return')
@Controller('web/pod/return')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebAwbReturnController {
  // TODO: create endpoint
  // 1. get data awb
  // 2. create data return awb
  // 3. get data address reseller ??

  @Post('getAwb')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebAwbReturnGetAwbResponseVm })
  public async bagValidate(@Body() payload: WebAwbReturnGetAwbPayloadVm) {
    return WebAwbReturnService.getAwb(payload);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebReturListResponseVm })
  public async listReturn(@Body() payload: BaseMetaPayloadVm) {
    return WebAwbReturnService.listReturn(payload);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebReturUpdateResponseVm })
  public async updateAwb(@Body() payload: WebReturUpdateListPayloadVm) {
    return WebAwbReturnService.updateAwbReturn(payload);
  }

  @Post('history')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebReturHistoryFindAllResponseVm })
  public async historyAwb(@Body() payload: WebReturHistoryPayloadVm) {
    return WebAwbReturnService.historyAwbReturn(payload);
  }

  @Post('list/stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async exportListAwbReturn(
    @Body() payload: BaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await WebAwbReturnService.exportReturnList(
      payload,
      outgoingHTTP,
    );
  }
}
