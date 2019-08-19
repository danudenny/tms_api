import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AwbUpdateStatusResponseVm, AwbUpdateStatusPayloadVm } from '../../models/awb-update-status.vm';
import { WebAwbUpdateStatusService } from '../../services/web/web-awb-update-status.service';

@ApiUseTags('Web Awb Update Status')
@Controller('web/pod/awb')

export class WebAwbUpdateStatusController {
  @Post('updateStatus')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: AwbUpdateStatusResponseVm })
  public async updateStatus(@Body() payload: AwbUpdateStatusPayloadVm) {
    return WebAwbUpdateStatusService.updateStatus(payload);
  }
}
