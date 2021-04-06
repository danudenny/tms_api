import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MonitoringBagHubResponseVm, MonitoringSortirHubResponseVm } from '../../../main/models/hub-monitoring.response.vm';
import { HubMonitoringService } from '../../../main/services/web/hub-transit/hub-monitoring.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Hub Monitoring')
@Controller('hub/monitoring')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class HubController {
  constructor() {}

  @Post('bag')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringBagHubResponseVm })
  public async monitoringBagHub(@Body() payload: BaseMetaPayloadVm) {
    return HubMonitoringService.monitoringBagHub(payload);
  }

  @Post('sortir')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringSortirHubResponseVm })
  public async monitoringSortirHub(@Body() payload: BaseMetaPayloadVm) {
    return HubMonitoringService.monitoringSortirHub(payload);
  }
}
