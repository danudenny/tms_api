import { Body, Controller, HttpCode, Post, UseGuards, HttpStatus } from '@nestjs/common';

import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { DoReturnService } from '../../services/do-return/do-return.service';
import { ReturnPayloadVm, DoReturnResponseVm } from '../../models/do-return.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DoReturnPayloadVm } from '../../models/do-return-update.vm';
import { ReturnFindAllResponseVm, DoReturnAdminFindAllResponseVm } from '../../models/do-return.response.vm';

@ApiUseTags('Do Return')
@Controller('doReturn')
export class DoReturnController {
  @Post('listAwb')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnFindAllResponseVm })
  public async findAllByRequest(@Body() payload: BaseMetaPayloadVm ) {
    return DoReturnService.findAllByRequest(payload);
  }

  @Post('updateStatus')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: ReturnFindAllResponseVm })
  public async updateDoReturn(@Body() payload: DoReturnPayloadVm ) {
    return DoReturnService.updateDoReturn(payload);
  }

  @Post('dolist/admin')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: DoReturnAdminFindAllResponseVm })
  public async findAllDoListAdmin(@Body() payload: BaseMetaPayloadVm ) {
    return DoReturnService.findAllDoListAdmin(payload);
  }
}
