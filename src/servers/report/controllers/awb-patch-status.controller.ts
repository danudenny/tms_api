import { HttpCode, Controller, Post, HttpStatus, UseGuards, Body } from '@nestjs/common';
import { ApiUseTags, ApiImplicitHeader, ApiOkResponse } from '../../../shared/external/nestjs-swagger';
import { AuthKeyCodGuard } from '../../../shared/guards/auth-key-cod.guard';
import { AwbPatchStatusSuccessResponseVm, AwbPatchStatusPayloadVm } from '../models/awb/awb-patch-status.vm';
import { AwbPatchStatusService } from '../services/awb/patch-status.service';

@ApiUseTags('Awb Patch Status')
@Controller('awb/patchStatus')
export class AwbPatchStatusController {
  constructor() {}

  @Post('dlv')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  @ApiOkResponse({ type: AwbPatchStatusSuccessResponseVm })
  public async patchDataDlv(@Body() payload: AwbPatchStatusPayloadVm) {
    return AwbPatchStatusService.patchDataDlv(payload);
  }
}