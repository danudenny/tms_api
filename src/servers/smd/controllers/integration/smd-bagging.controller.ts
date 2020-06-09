import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import {BaggingSmdService} from '../../services/integration/bagging-smd.service';
import {SmdScanBaggingPayloadVm} from '../../../main/models/smd-bagging-payload.vm';
import {PermissionTokenGuard} from '../../../../shared/guards/permission-token.guard';
import {ResponseSerializerOptions} from '../../../../shared/decorators/response-serializer-options.decorator';
import {BaseMetaPayloadVm} from '../../../../shared/models/base-meta-payload.vm';
import {ListBaggingResponseVm, ListDetailBaggingResponseVm, SmdScanBaggingResponseVm} from '../../../main/models/smd-bagging-response.vm';

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
  public async createBagging(@Body() payload: SmdScanBaggingPayloadVm) {
    return BaggingSmdService.createBagging(payload);
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
