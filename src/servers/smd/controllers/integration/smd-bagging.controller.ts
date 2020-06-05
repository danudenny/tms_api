import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import {BaggingSmdService} from '../../services/integration/bagging-smd.service';
import {SmdScanBaggingPayloadVm} from '../../../main/models/smd-bagging-payload.vm';
import {PermissionTokenGuard} from '../../../../shared/guards/permission-token.guard';
import {ResponseSerializerOptions} from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('SMD Bagging')
@Controller('smd/bagging')
export class SmdBaggingController {
  constructor() {}
  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async createBagging(@Body() payload: SmdScanBaggingPayloadVm) {
    return BaggingSmdService.createBagging(payload);
  }
}
