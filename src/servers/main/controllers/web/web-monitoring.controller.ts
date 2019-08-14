import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BagMonitoringPayloadVm } from '../../models/bag-monitoring-payload.vm';
import { BagMonitoringResponseVm } from '../../models/bag-monitoring-response.vm';
import { WebMonitoringService } from '../../services/web/web-monitoring.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Web Monitoring')
@Controller('web/monitoring')
export class WebMonitoringController {
  @Post('bagIn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: BagMonitoringResponseVm })
  public async troubledList(@Body() payload: BagMonitoringPayloadVm) {
    return WebMonitoringService.findAllByRequest(payload);
  }
}
