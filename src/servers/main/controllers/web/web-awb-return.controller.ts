import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebAwbReturnGetAwbPayloadVm, WebAwbReturnGetAwbResponseVm } from '../../models/web-awb-return.vm';
import { WebAwbReturnService } from '../../services/web/web-awb-return.service';
import { WebReturListResponseVm } from '../../models/web-retur-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

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
}
