import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebAwbReturnCancelService } from '../../services/web/web-awb-return-cancel.service';
import { WebReturCancelListResponse } from '../../models/web-retur-cancel-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
@ApiUseTags('Web Awb Return')
@Controller('v1/web/pod/return')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebAwbReturnCancelController {

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
