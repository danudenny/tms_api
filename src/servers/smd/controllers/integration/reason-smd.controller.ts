import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ReasonSmdService } from '../../services/integration/reason-smd.service';
import { ReasonSmdFindAllResponseVm } from '../../models/reason-smd.response.vm';

@ApiUseTags('SMD')
@Controller('smd/reason')
export class ReasonSmdController {
  constructor() {}
  @Post('list')
  @HttpCode(HttpStatus.OK)
  public async findReasonName(@Body() payload: BaseMetaPayloadVm) {
    return ReasonSmdService.findAllByRequest(payload);
  }
}
