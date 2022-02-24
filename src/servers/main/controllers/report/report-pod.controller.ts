import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiUseTags, ApiOkResponse, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ReportAttendancePayloadVm } from '../../models/report-attendance-in-payload.vm';
import { ReportAttendanceResponseVm } from '../../models/report-attendance-response.vm';
import { ReportAttendanceService } from '../../services/report/report-attendance.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ReportPodService } from '../../services/report/report-pod.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
@ApiUseTags('Report POD')
@Controller('Report')
export class ReportPODController {
  constructor() {}

  @Post('web/attendance')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: ReportAttendanceResponseVm })
  public async listAttendance(@Body() payload: ReportAttendancePayloadVm ) {
    return ReportAttendanceService.reportListAttendance(payload);
  }

  @Post('pod')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard,PermissionTokenGuard)
  public async export(
    @Body() payload: BaseMetaPayloadVm,
    @Query() queryParams: {
      reportType: string;
    }
  ) {
    return ReportPodService.generateReport(payload, queryParams.reportType);
  }

  @Get('pod')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard,PermissionTokenGuard)
  public async fetchExport(
    @Query() queryParams: {
      page: string;
      limit: string;
      reportType: string;
    }
  ) {
    return ReportPodService.fetchReportResult(queryParams.page, queryParams.limit, queryParams.reportType);
  }
}
