import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BagReportGeneratePayloadVm, BagReportListPayloadVm } from '../../models/bag/bag-report.payload';
import { BagReportingService } from '../../services/bag/bag-reporting.service';

@ApiUseTags('Hub Bags Reporting Controller')
@Controller('hub/bag/reporting')
export class BagReportingController {
  constructor(
    private readonly reportService: BagReportingService,
  ) {}

  @Post('generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public generateBagAWB(@Body() payload: BagReportGeneratePayloadVm): Promise<any> {
    return this.reportService.bagGenerateReport(payload);
  }

  @Post('list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public listBagAWB(@Body() payload: BagReportListPayloadVm): Promise<any> {
    return this.reportService.checkBagListReport(payload);
  }

}
