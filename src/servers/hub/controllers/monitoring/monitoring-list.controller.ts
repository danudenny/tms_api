import { Controller, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Hub Packages Monitoring')
@Controller('monitoring-hub-package')
export class HubPackagesMonitoringController {
  @Post('/total/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getMonitoringTotalList() {
    return true;
  }
}
