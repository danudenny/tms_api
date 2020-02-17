import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';

import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileDashboardFindAllResponseVm, MobileDetailTransitResponseVm } from '../../models/mobile-dashboard.response.vm';
import { MobileInitDataPayloadVm } from '../../models/mobile-init-data-payload.vm';
import { MobileInitDataResponseVm } from '../../models/mobile-init-data-response.vm';
import { MobileDashboardService } from '../../services/mobile/mobile-dashboard.service';
import { MobileInitDataService } from '../../services/mobile/mobile-init-data.service';
import { EmployeeResponseVm } from '../../models/employee.response.vm';
import { EmployeeService } from '../../services/master/employee.service';
import { MobileComplaintResponseVm } from '../../models/mobile-complaint-response.vm';
import { FileInterceptor } from '@nestjs/platform-express';
import { MobileComplaintPayloadVm } from '../../models/mobile-complaint-payload.vm';
import { MobileComplaintListResponseAllVm } from '../../models/mobile-complaint-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import moment = require('moment');
import { RedisService } from '../../../../shared/services/redis.service';
import { MobileInitCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import { MobileInitCheckInService } from '../../services/mobile/mobile-init-check-in.service';
import { DetailTransitPayloadVm } from '../../models/mobile-dashboard.vm';

@ApiUseTags('Dashboard')
@Controller('mobile')
export class MobileDashboardController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileDashboardFindAllResponseVm })
  public async dashboard() {
    return MobileDashboardService.getDashboardDataByRequest();
  }

  @Post('initData')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async initData(@Body() payload: MobileInitDataPayloadVm) {
    return MobileInitDataService.getInitDataByRequest(payload.lastSyncDateTime);
  }

  @Get('initCheckin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitCheckInResponseVm })
  public async initCheckin() {
    return MobileInitCheckInService.getInitCheckInByRequest();
  }

  @Get('employee/:employeeId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: EmployeeResponseVm })
  public async findEmployee(@Param('employeeId') employeeId: number) {
    return this.employeeService.findById(employeeId);
  }

  @Post('complaint')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileComplaintResponseVm })
  public async complaintSigesit(
    @Body() payload: MobileComplaintPayloadVm,
    @UploadedFile() file,
  ) {
    return MobileInitDataService.complaintSigesit(payload, file);
  }

  @Post('complaint/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileComplaintListResponseAllVm })
  public async complaintList(@Body() payload: BaseMetaPayloadVm) {
    return MobileInitDataService.complaintListSigesit(payload);
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  public async ping() {
    return {
      message: 'pong',
      timeNow: moment().toDate(),
      timeString: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  @Get('version/:versionApp')
  @HttpCode(HttpStatus.OK)
  public async mobileVersion(@Param('versionApp') version: string) {
    const versionRedis = await RedisService.get(`pod:mobile:versionApp`);
    const versionApp = versionRedis ? versionRedis : process.env.ANDROID_APP_VERSION;
    const valid = version == versionApp ? true : false;
    return {
      currentVersion: versionApp,
      valid,
      timeNow: moment().toDate(),
      timeString: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
  }

  @Post('detail/transit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileDetailTransitResponseVm })
  public async detailTransit( @Body() payload: DetailTransitPayloadVm ) {
    return MobileDashboardService.getTransitDetail(payload);
  }
}
