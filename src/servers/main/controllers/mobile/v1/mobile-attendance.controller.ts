import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors, Param, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiUseTags, ApiOkResponse, ApiBearerAuth } from '../../../../../shared/external/nestjs-swagger';
import { MobileCheckInResponseVm } from '../../../models/mobile-check-in-response.vm';
import { MobileAttendanceInPayloadVm } from '../../../models/mobile-attendance-in-payload.vm';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { MobileCheckOutResponseVm } from '../../../models/mobile-check-out-response.vm';
import { MobileAttendanceOutPayloadVm } from '../../../models/mobile-attendance-out-payload.vm';
import { V1MobileAttendanceService } from '../../../services/mobile/v1/mobile-attendance.service';
import { MobileInitDataPayloadVm } from '../../../models/mobile-init-data-payload.vm';
import { MobileAttendanceInitResponseVm } from '../../../models/mobile-attendance-in-response.vm';
import { RedisService } from '../../../../../shared/services/redis.service';
import moment = require('moment');

@ApiUseTags('Mobile Employee Attendance')
@Controller('mobile/v1/employee')
@ApiBearerAuth()
export class V1MobileAttendanceController {
  constructor() {}

  @Post('initDataAttendance')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAttendanceInitResponseVm })
  public async initDataLogin(@Body() payload: MobileInitDataPayloadVm) {
    return V1MobileAttendanceService.getInitData(payload.lastSyncDateTime);
  }

  @Post('attendance/checkIn')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckInResponseVm })
  public async checkInAttendance(
    @Body() payload: MobileAttendanceInPayloadVm,
    @UploadedFile() file,
  ) {
    return V1MobileAttendanceService.checkInAttendance(payload, file);
  }

  @Post('attendance/checkOut')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckOutResponseVm })
  public async checkoutAttendance(
    @Body() payload: MobileAttendanceOutPayloadVm,
    @UploadedFile() file,
  ) {
    return V1MobileAttendanceService.checkOutAttendance(payload, file);
  }

  @Get('attendance/version/:versionApp')
  @HttpCode(HttpStatus.OK)
  public async mobileVersion(@Param('versionApp') version: string) {
    const versionRedis = await RedisService.get(`attendance:mobile:versionApp`);
    const versionApp = versionRedis
      ? versionRedis
      : process.env.ATTENDANCE_APP_VERSION;
    const valid = version == versionApp ? true : false;
    return {
      currentVersion: versionApp,
      valid,
      timeNow: moment().toDate(),
      timeString: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
  }
}
