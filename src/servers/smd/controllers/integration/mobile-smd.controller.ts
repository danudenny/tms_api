import { Body, Controller, Post, Req, UseGuards, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
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
import { MobileSmdListDetailPayloadVm, MobileSmdDeparturePayloadVm, MobileSmdArrivalPayloadVm } from '../../models/mobile-smd.payload.vm';
import { MobileSmdService } from '../../services/integration/mobile-smd.service';

@ApiUseTags('Mobile SMD')
@Controller('smd')
export class MobileSmdController {
  constructor() {}

  @Post('mobile/departure')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanOutMobile(@Req() request: any, @Body() payload: MobileSmdDeparturePayloadVm) {
    return MobileSmdService.scanOutMobile(payload);
  }

  @Post('mobile/arrival')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInMobile(@Req() request: any, @Body() payload: MobileSmdArrivalPayloadVm) {
    return MobileSmdService.scanInMobile(payload);
  }

  @Post('mobile/problem')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async problemMobile(@Req() request: any, @Body() payload: MobileSmdArrivalPayloadVm) {
    return MobileSmdService.problemMobile(payload);
  }

}
