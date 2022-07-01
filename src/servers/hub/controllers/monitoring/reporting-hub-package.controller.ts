import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMonitoringHubPackage, PayloadMonitoringHubPackageList } from '../../models/monitoring/monitoring-hub-package.vm';
import { ReportingHubPackageService } from '../../services/monitoring/reporting-hub-package.service';

@ApiUseTags('Monitoring Hub Package')
@Controller('monitoring-hub-package')
export class ReportingHubPackage {
  constructor() {}

  @Post('reporting-hub/generate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async generateReportPackageHub(@Body() payload: BaseMonitoringHubPackage) {
    return ReportingHubPackageService.PackageHubGenerate(payload);
  }

  @Post('reporting-hub/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async generateReportPackageList(@Body() payload: PayloadMonitoringHubPackageList) {
    return ReportingHubPackageService.PackageHubList(payload);
  }

}
