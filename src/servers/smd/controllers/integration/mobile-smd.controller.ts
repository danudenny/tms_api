import { Body, Controller, Post, Req, UseGuards, Delete, Param, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ScanoutSmdService } from '../../services/integration/scanout-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanOutSmdVehiclePayloadVm, ScanOutSmdRoutePayloadVm, ScanOutSmdItemPayloadVm, ScanOutSmdSealPayloadVm, ScanOutSmdHandoverPayloadVm, ScanOutSmdDetailPayloadVm } from '../../models/scanout-smd.payload.vm';
import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { MobileSmdListVm, MobileSmdListDetailBagVm, MobileSmdListDetailBaggingVm } from '../../models/mobile-smd-list.response.vm';
import { MobileSmdListDetailPayloadVm, MobileSmdDeparturePayloadVm, MobileSmdArrivalPayloadVm, MobileUploadImagePayloadVm, MobileSmdProblemPayloadVm, MobileSmdContinuePayloadVm, MobileSmdHandOverPayloadVm } from '../../models/mobile-smd.payload.vm';
import { MobileSmdService } from '../../services/integration/mobile-smd.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MobileUploadImageResponseVm } from '../../models/mobile-smd.response.vm';

@ApiUseTags('Mobile SMD')
@Controller('mobile')
export class MobileSmdController {
  constructor() {}

  @Post('smd/departure')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutMobile(@Req() request: any, @Body() payload: MobileSmdDeparturePayloadVm) {
    return MobileSmdService.scanOutMobile(payload);
  }

  @Post('smd/arrival')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInMobile(@Req() request: any, @Body() payload: MobileSmdArrivalPayloadVm) {
    return MobileSmdService.scanInMobile(payload);
  }

  @Post('smd/cancelArrival')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInCancelMobile(@Req() request: any, @Body() payload: MobileSmdArrivalPayloadVm) {
    return MobileSmdService.scanInCancelMobile(payload);
  }

  @Post('smd/end')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInEndMobile(@Req() request: any, @Body() payload: MobileSmdArrivalPayloadVm) {
    return MobileSmdService.scanInEndMobile(payload);
  }

  @Post('smd/image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileUploadImageResponseVm })
  @Transactional()
  public async uploadImageMobile(
    @Body() payload: MobileUploadImagePayloadVm,
    @UploadedFile() file,
  ) {
    return MobileSmdService.uploadImageMobile(payload, file);
  }

  @Post('smd/problem')
  @UseInterceptors(FileInterceptor('file'))
  @Transactional()
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async problemMobile( @Body() payload: MobileSmdProblemPayloadVm, @UploadedFile() file) {
    return MobileSmdService.problemMobile(payload, file);
  }

  @Post('smd/continue')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async continueMobile(@Req() request: any, @Body() payload: MobileSmdContinuePayloadVm) {
    return MobileSmdService.continueMobile(payload);
  }

  @Post('smd/handover')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async handOverMobile(@Req() request: any, @Body() payload: MobileSmdHandOverPayloadVm) {
    return MobileSmdService.handOverMobile(payload);
  }

}
