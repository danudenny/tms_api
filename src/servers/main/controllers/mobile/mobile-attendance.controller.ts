import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiUseTags, ApiOkResponse, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
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

@ApiUseTags('Mobile Attendance')
@Controller('mobile')
export class MobileAttendanceController {
  constructor(private readonly mobileAttendanceService: MobileAttendanceService) {}

  @Post('attendance/checkIn')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckInResponseVm })
  public async checkInAttendance(
    @Body() payload: MobileAttendanceInPayloadVm,
    @UploadedFile() file,
  ) {
    return this.mobileAttendanceService.checkInAttendance(payload, file);
  }

  @Post('attendance/checkOut')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckOutResponseVm })
  @Transactional()
  public async checkoutAttendance(
    @Body() payload: MobileAttendanceOutPayloadVm,
    @UploadedFile() file,
  ) {
    return this.mobileAttendanceService.checkOutAttendance(payload, file);
  }

  @Post('attendance/list')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileAtendanceListResponseVm })
  public async listAttendance(@Body() payload: BaseMetaPayloadVm) {
    return this.mobileAttendanceService.listAttendance(payload);
  }
}
