import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMonitoringHubPackage, PayloadMonitoringHubPackageList } from '../../models/monitoring/monitoring-hub-package.vm';
import { ReportingHubPackageService } from '../../services/monitoring/reporting-hub-package.service';

@ApiUseTags('Monitoring Hub Package')
@Controller('monitoring-hub-package')
export class ReportingHubPackageController {
  constructor(private readonly reportHubPackage: ReportingHubPackageService) {}

  @Post('reporting-hub/generate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public generateReportHub(@Body() payload: BaseMonitoringHubPackage): Promise<any>  {
    return this.reportHubPackage.PackageHubGenerate(payload);
  }

  @Post('reporting-hub/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public generateReportPackageList(@Body() payload: PayloadMonitoringHubPackageList): Promise<any>  {
    return this.reportHubPackage.PackageHubList(payload);
  }
}
