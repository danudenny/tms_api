import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import { MobileAttendanceInPayloadVm } from '../../models/mobile-attendance-in-payload.vm';
import { MobileCheckOutResponseVm } from '../../models/mobile-check-out-response.vm';
import { MobileAttendanceOutPayloadVm } from '../../models/mobile-attendance-out-payload.vm';
import { MobileAttendanceService } from '../../services/mobile/mobile-attendance.service';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MobileAtendanceListResponseVm } from '../../models/mobile-attendance-list-response.vm';
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
