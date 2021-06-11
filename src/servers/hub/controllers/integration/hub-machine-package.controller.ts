import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiImplicitHeader, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { MachinePackageResponseVm, PackageAwbResponseVm } from '../../models/hub-gabungan.response.vm';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { HubMachineService } from '../../services/integration/hub-machine-package.services';
import { PackageMachinePayloadVm } from '../../models/hub-gabungan-mesin-payload.vm';
import { Transaction } from 'typeorm';

@ApiUseTags('Hub Mesin Sortir Resi Bag')
@Controller('hub/sortir/combine')
export class HubMachinePackageController {
  constructor() {}

  @Post('packages')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: MachinePackageResponseVm })
  @Transaction()
  public async checkSpk(@Body() payload: PackageMachinePayloadVm) {
    return HubMachineService.awbPackage(payload);
  }
}
