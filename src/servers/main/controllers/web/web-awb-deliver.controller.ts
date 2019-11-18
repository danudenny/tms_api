import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { Controller, UseGuards, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebAwbDeliverGetPayloadVm, WebAwbDeliverGetResponseVm, WebAwbDeliverSyncPayloadVm, WebAwbDeliverSyncResponseVm } from '../../models/web-awb-deliver.vm';
import { WebAwbDeliverService } from '../../services/web/web-awb-deliver.service';

@ApiUseTags('Web Pod Manual')
@Controller('web/pod/manual')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebAwbDeliverController {
  // 1. get data awb deliver

  @Post('getAwb')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebAwbDeliverGetResponseVm })
  public async getAwb(@Body() payload: WebAwbDeliverGetPayloadVm) {
    return WebAwbDeliverService.getAwbDeliver(payload);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebAwbDeliverSyncResponseVm })
  public async syncAwb(@Body() payload: WebAwbDeliverSyncPayloadVm) {
    return WebAwbDeliverService.syncAwbDeliver(payload);
  }
}
