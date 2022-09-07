import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { SortationReportGeneratePayloladVm, SortationReportListPayloadVm } from '../../../models/sortation/web/sortation-report-payload.vm';
import { SortationReportService } from '../../../services/sortation/web/sortation-report.service';

@ApiUseTags('Sortation Reporting')
@Controller('sortation/queue/reporting')
export class SortationReportController {
  constructor() {
  }

  @Post('list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async sortationList(@Body() payload: SortationReportListPayloadVm) {
    return SortationReportService.sortationListReport(payload);
  }

  @Post('generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async genereteSortationReport(@Body() payload: SortationReportGeneratePayloladVm) {
    return SortationReportService.sortationGenerateReport(payload);
  }
}
