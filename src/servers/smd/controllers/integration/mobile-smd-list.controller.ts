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
import { MobileSmdListService } from '../../services/integration/mobile-smd-list.service';
import { MobileSmdListVm, MobileSmdListDetailBagVm, MobileSmdListDetailBaggingVm, MobileSmdListDetailBagRepresentativeVm } from '../../models/mobile-smd-list.response.vm';
import { MobileSmdListDetailPayloadVm, MobileSmdListHistoryPayloadVm } from '../../models/mobile-smd.payload.vm';

@ApiUseTags('Mobile SMD')
@Controller('mobile')
export class MobileSmdListController {
  constructor() {}

  @Post('smd/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSmdListVm })
  public async getScanOutMobileList() {
    return MobileSmdListService.getScanOutMobileList();
  }

  @Post('smd/list/detail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSmdListVm })
  public async getScanOutMobileListDetail(@Body() payload: MobileSmdListDetailPayloadVm) {
    return MobileSmdListService.getScanOutMobileListDetail(
      payload.do_smd_detail_id,
      payload.do_smd_status,
    );
  }

  @Post('smd/list/detailBag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSmdListDetailBagVm })
  public async getScanOutMobileListDetailBag(@Body() payload: MobileSmdListDetailPayloadVm) {
    return MobileSmdListService.getScanOutMobileListDetailBag(
      payload.do_smd_detail_id,
    );
  }

  @Post('smd/list/detailBagging')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSmdListDetailBaggingVm })
  public async getScanOutMobileListDetailBagging(@Body() payload: MobileSmdListDetailPayloadVm) {
    return MobileSmdListService.getScanOutMobileListDetailBagging(
      payload.do_smd_detail_id,
    );
  }

  @Post('smd/list/detailBagRepresentative')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSmdListDetailBagRepresentativeVm })
  public async getScanOutMobileListDetailBagRepresentative(@Body() payload: MobileSmdListDetailPayloadVm) {
    return MobileSmdListService.getScanOutMobileListDetailBagRepresentative(
      payload.do_smd_detail_id,
    );
  }

  @Post('smd/list/history')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSmdListVm })
  public async getScanOutMobileListHistory(@Body() payload: MobileSmdListHistoryPayloadVm) {
    return MobileSmdListService.getScanOutMobileListHistory(
      payload.start_date,
      payload.end_date,
    );
  }

}
