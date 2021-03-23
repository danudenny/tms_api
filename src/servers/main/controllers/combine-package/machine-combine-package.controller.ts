import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiImplicitHeader, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PackagePayloadVm } from '../../models/gabungan-payload.vm';
import { MachinePackageResponseVm, PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { PackageService } from '../../services/combine-package/package.services';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { V1PackageService } from '../../services/combine-package/v1/package.services';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { V1MachineService } from '../../services/combine-package/v1/machine-package.services';
import { PackageMachinePayloadVm } from '../../models/gabungan-mesin-payload.vm';

@ApiUseTags('Mesin Sortir Resi Bag')
@Controller('sortir/combine')
export class SortirCombinePackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('packages')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: MachinePackageResponseVm })
  public async checkSpk(@Body() payload: PackageMachinePayloadVm) {
    return V1MachineService.awbPackage(payload);
  }

  // @Post('packages')
  // @HttpCode(200)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ApiOkResponse({ type: PackageAwbResponseVm })
  // public async packageAwb(@Body() payload: PackagePayloadVm) {
  //   // return this.packageService.awbPackage(payload);
  //   return V1PackageService.awbPackage(payload);
  // }

  // @Post('loadPackages')
  // @HttpCode(200)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ApiOkResponse({ type: PackageAwbResponseVm })
  // public async loadPackageAwb() {
  //   // return this.packageService.loadAwbPackage();
  //   return V1PackageService.loadAwbPackage();
  // }
}
