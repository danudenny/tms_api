import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { VehicleSmdService } from '../../services/integration/vehicle-smd.service';
import { ReasonSmdFindAllResponseVm } from '../../models/reason-smd.response.vm';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('SMD')
@Controller('smd/vehicle')
export class VehicleSmdController {
  constructor() {}
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async findReasonName(@Body() payload: BaseMetaPayloadVm) {
    return VehicleSmdService.findAllByRequest(payload);
  }
}
