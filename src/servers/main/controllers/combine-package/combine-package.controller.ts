import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PackagePayloadVm } from '../../models/gabungan-payload.vm';
import { PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { PackageService } from '../../services/combine-package/package.services';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { V1PackageService } from '../../services/combine-package/v1/package.services';

@ApiUseTags('Resi Bag')
@Controller('combine')
export class CombinePackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('packages')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async packageAwb(@Body() payload: PackagePayloadVm) {
    // return this.packageService.awbPackage(payload);
    return V1PackageService.awbPackage(payload);
  }

  @Post('loadPackages')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async loadPackageAwb() {
    return this.packageService.loadAwbPackage();
  }
}
