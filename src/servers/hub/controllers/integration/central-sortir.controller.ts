import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CentralHubReportPayloadVm, CentralSortirListPayloadVm, CentralSortirPayloadVm } from '../../models/central-sortir-payload.vm';
import { CentralSortirService } from '../../services/integration/central-sortir.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { HUB_REPORT } from '../../../../shared/constants/laporan-hub.constat';

@Controller('central/sortir')
export class CentralSortirController {

  @Post('queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async generatedMesinSortirReporting(@Body() payload: CentralSortirPayloadVm) {
    return CentralSortirService.generateReportingMesinSortir(payload);
  }

  @Post('queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async getListMesinSortirReporting(@Body() body: CentralSortirListPayloadVm) {
    return CentralSortirService.getListMesinSortirReporting(body);
  }

  @Post('do-hub/queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async generatedMonitoringHubMacineReporting(@Body() payload: CentralHubReportPayloadVm) {
    return CentralSortirService.generateReportingLaporanHub(payload, HUB_REPORT.HUB_MACHINE);
  }

  @Post('do-hub/queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async getListMonitoringHubMacineReporting(@Body() body: CentralSortirListPayloadVm) {
    return CentralSortirService.getListLaporanHubReporting(body, HUB_REPORT.HUB_MACHINE);
  }

  @Post('lebih-sortir/queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async generatedLebihSortirReporting(@Body() payload: CentralHubReportPayloadVm) {
    return CentralSortirService.generateReportingLaporanHub(payload, HUB_REPORT.LEBIH_SORTIR);
  }

  @Post('lebih-sortir/queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async getListLebihSortirReporting(@Body() body: CentralSortirListPayloadVm) {
    return CentralSortirService.getListLaporanHubReporting(body, HUB_REPORT.LEBIH_SORTIR);
  }
}
