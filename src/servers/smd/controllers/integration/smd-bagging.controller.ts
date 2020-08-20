import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaggingSmdService } from '../../services/integration/bagging-smd.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { SmdScanBaggingResponseVm, ListBaggingResponseVm, ListDetailBaggingResponseVm, SmdScanBaggingMoreResponseVm } from '../../models/smd-bagging-response.vm';
import { SmdScanBaggingPayloadVm, SmdScanBaggingMorePayloadVm } from '../../models/smd-bagging-payload.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';

@ApiUseTags('SMD Bagging')
@Controller('smd/bagging')
export class SmdBaggingController {
  constructor() {}
  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SmdScanBaggingResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @Transactional()
  public async createBagging(@Body() payload: SmdScanBaggingPayloadVm) {
    return BaggingSmdService.createBagging(payload);
  }

  @Post('create/manual-input')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SmdScanBaggingMoreResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @Transactional()
  public async createBaggingMore(@Body() payload: SmdScanBaggingMorePayloadVm) {
    return BaggingSmdService.createBaggingMore(payload);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ListBaggingResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async listBagging(@Body() payload: BaseMetaPayloadVm) {
    return BaggingSmdService.listBagging(payload);
  }

  @Post('list/detail')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ListDetailBaggingResponseVm })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async listDetailBagging(@Body() payload: BaseMetaPayloadVm) {
    return BaggingSmdService.listDetailBagging(payload);
  }
}
