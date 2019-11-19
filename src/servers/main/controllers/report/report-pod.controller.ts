import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ReportAttendancePayloadVm } from '../../models/report-attendance-in-payload.vm';
import { ReportAttendanceResponseVm } from '../../models/report-attendance-response.vm';
import { ReportAttendanceService } from '../../services/report/report-attendance.service';

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
}
