import {
    ApiUseTags,
    ApiBearerAuth,
  } from '../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body, UseGuards } from '@nestjs/common';
import { RolePodManualPayloadGetVm, RolePodManualPayloadPostVm } from '../../models/role-pod-manual-payload.vm';
import { RolePodManual } from '../../services/web/role-pod-manual.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';

@ApiUseTags('Role Pod Manual')
@Controller('role-pod-manual')
export class RolePodManualController {
  @Post('/get-status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  public async getPodManualList(@Body() payload: RolePodManualPayloadGetVm) {
    return RolePodManual.getStatus(payload);
  }
  @Post('/post-status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async podManualStore(@Body() payload: RolePodManualPayloadPostVm) {
    return RolePodManual.postStatus(payload);
  }

}
