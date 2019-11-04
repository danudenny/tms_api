import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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

@ApiUseTags('Mobile Attendance')
@Controller('mobile')
export class MobileAttendanceController {
  constructor(private readonly mobileAttendanceService: MobileAttendanceService) {}

  @Post('checkIn')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckInResponseVm })
  public async checkInAttendance(
    @Body() payload: MobileAttendanceInPayloadVm,
    @UploadedFile() file,
  ) {
    return this.mobileAttendanceService.checkInAttendance(payload, file);
  }

  @Post('checkOut')
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
}
