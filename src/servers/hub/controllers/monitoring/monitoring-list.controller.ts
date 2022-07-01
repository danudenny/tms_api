import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { HubMonitoringDetailListPayloadVm } from '../../models/monitoring/monitoring-payload.vm';
import { HubPackagesMonitoringService } from '../../services/monitoring/monitoring.service';

@ApiUseTags('Hub Packages Monitoring')
@Controller('monitoring-hub-package')
export class HubPackagesMonitoringController {
  constructor(private readonly monitoringService: HubPackagesMonitoringService) {}

  @Post('total/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getMonitoringTotalList() {
    return true;
  }

  @Post('detail/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getMonitoringDetailList(
    @Body() payload: HubMonitoringDetailListPayloadVm,
  ): Promise<any> {
    // pass-through response
    return this.monitoringService.getDetail(payload);
  }
}
