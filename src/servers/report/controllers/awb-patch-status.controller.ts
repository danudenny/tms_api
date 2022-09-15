import { HttpCode, Controller, Post, HttpStatus, UseGuards, Body } from '@nestjs/common';
import { ApiUseTags, ApiImplicitHeader, ApiOkResponse } from '../../../shared/external/nestjs-swagger';
import { AuthKeyCodGuard } from '../../../shared/guards/auth-key-cod.guard';
import { AwbPatchDataSuccessResponseVm } from '../models/awb/awb-patch-data.vm';
import { AwbPatchStatusSuccessResponseVm, AwbPatchStatusPayloadVm, AwbPatch3PLResiPayloadVm } from '../models/awb/awb-patch-status.vm';
import { AwbPatchStatusService } from '../services/awb/patch-status.service';

@ApiUseTags('Awb Patcher')
@Controller('awb/patcher')
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

  @Post('data')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  @ApiOkResponse({ type: AwbPatchDataSuccessResponseVm })
  public async patchDataTable(@Body() payload: any) {
    return AwbPatchStatusService.patchDataTable(payload);
  }

  @Post('3pl')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  @ApiOkResponse({ type: AwbPatchStatusSuccessResponseVm })
  public async patchDataDlva(@Body() payload: AwbPatch3PLResiPayloadVm) {
    return AwbPatchStatusService.patchData3PL(payload);
  }
}
