import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { Controller, UseGuards, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebAwbDeliverSyncPayloadVm, WebAwbDeliverSyncResponseVm } from '../../models/web-awb-deliver.vm';
import { WebAwbDeliverService } from '../../services/web/web-awb-deliver.service';

@ApiUseTags('Web Pod Manual')
@Controller('web/pod/manual')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebAwbDeliverController {

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebAwbDeliverSyncResponseVm })
  public async syncAwb(@Body() payload: WebAwbDeliverSyncPayloadVm) {
    return WebAwbDeliverService.syncAwbDeliver(payload);
  }
}
