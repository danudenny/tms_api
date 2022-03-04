import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebAwbReturnCancelService } from '../../services/web/web-awb-return-cancel.service';
import { WebReturCancelListResponse, WebAwbReturnCancelCreateResponse } from '../../models/web-retur-cancel-response.vm';
import { WebAwbReturnCancelCreatePayload } from '../../models/web-awb-return-cancel.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
@ApiUseTags('Web Awb Return')
@Controller('web/v1/pod/return')
export class WebAwbReturnCancelController {

  @Post('createCancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbReturnCancelCreateResponse })
  @Transactional()
  public async scanOutCreate(@Body() payload: WebAwbReturnCancelCreatePayload) {
    return WebAwbReturnCancelService.createAwbReturnCancel(payload);
  }

  @Post('list/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebReturCancelListResponse })
  public async listReturnCancel(@Body() payload: BaseMetaPayloadVm) {
    return WebAwbReturnCancelService.listReturnCancel(payload);
  }

  @Post('list/cancel/count')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebReturCancelListResponse })
  public async listReturnCancelCount(@Body() payload: BaseMetaPayloadVm) {
    return WebAwbReturnCancelService.listReturnCountCancel(payload);
  }
}
