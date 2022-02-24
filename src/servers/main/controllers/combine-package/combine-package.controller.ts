import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { LoadPackagesPayloadVm, PackagePayloadVm } from '../../models/gabungan-payload.vm';
import { PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { PackageService } from '../../services/combine-package/package.services';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { V1PackageService } from '../../services/combine-package/v1/package.services';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';

@ApiUseTags('Resi Bag')
@Controller('combine')
export class CombinePackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('packages')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  // NOTE: refactoring handle data
  public async packageAwb(@Body() payload: PackagePayloadVm) {
    // return this.packageService.awbPackage(payload);
    return V1PackageService.awbPackage(payload);
  }

  @Post('loadPackages')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async loadPackageAwb(@Body() payload: LoadPackagesPayloadVm) {
    // return this.packageService.loadAwbPackage();
    return V1PackageService.loadAwbPackage(payload);
  }
}
