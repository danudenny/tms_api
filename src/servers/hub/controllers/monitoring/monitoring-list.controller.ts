import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { HubMonitoringDetailListResponseVm } from '../../models/monitoring/monitoring-response.vm';
import { HubPackagesMonitoringService } from '../../services/monitoring/monitoring.service';

@ApiUseTags('Hub Packages Monitoring')
@Controller('monitoring-hub-package')
export class HubPackagesMonitoringController {
  constructor(
    private readonly monitoringService: HubPackagesMonitoringService,
  ) {}

  @Post('total/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getMonitoringTotalList() {
    return true;
  }

  @Post('detail/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getMonitoringDetailList(
    @Body() payload: BaseMetaPayloadVm,
  ): Promise<HubMonitoringDetailListResponseVm> {
    return this.monitoringService.getDetail(payload);
  }
}
