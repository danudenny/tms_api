import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { CheckAwbDetailResponVm, CheckAwbListResponVm } from '../../models/check-awb/check-awb-list.response';
import { CheckAwbReportGeneratePayloadVm, CheckAwbReportListPayloadVm } from '../../models/check-awb/check-awb-report-payload.vm';
import { CheckAwbListService } from '../../services/check-awb/check-awb-list.service';
import { CheckAwbReportService } from '../../services/check-awb/check-awb-report.service';

@ApiUseTags('Reporting Check AWB Destination')
@Controller('hub/check-awb/report')
export class CheckAwbReportController {
  constructor(
    private readonly checkAwbReportService: CheckAwbReportService,
    ) {}

    @Post('list')
    @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
    public getListReportCheckAWB(@Body() payload: CheckAwbReportListPayloadVm): Promise<any> {
      return this.checkAwbReportService.checkAwbListReport(payload);
    }

    @Post('generate')
    @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
    public generateCheckAWB(@Body() payload: CheckAwbReportGeneratePayloadVm): Promise<any> {
      return this.checkAwbReportService.checkAwbGenerateReport(payload);
    }

  }
