import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { DoReturnService } from '../../services/do-return/do-return.service';
import { ReturnPayloadVm, DoReturnResponseVm } from '../../models/do-return.vm';
import { BaseMetaPayloadVm } from 'src/shared/models/base-meta-payload.vm';

@ApiUseTags('Do Return')
@Controller('doBalik')
export class DoReturnController {
  constructor(private readonly doReturnService: DoReturnService) {}

  @Post('list')
  @HttpCode(200)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: DoReturnResponseVm })
  public async findAllByRequest(@Body() payload: BaseMetaPayloadVm ) {
    return this.doReturnService.findAllByRequest(payload);
  }
}
