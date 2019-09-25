import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { GabunganPayloadVm, PackagePayloadVm } from '../../models/gabungan-payload.vm';
import { GabunganFindAllResponseVm, PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { PackageService } from '../../services/combine-package/package.services';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Resi Bag')
@Controller('combine')
export class CombinePackageController {
  constructor(private readonly packageService: PackageService) {}

  // NOTE: not used
  // @Post('bag')
  // @HttpCode(200)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: GabunganFindAllResponseVm })
  // public async gabunganAwb(@Body() payload: GabunganPayloadVm) {
  //   return this.packageService.gabunganAwb(payload);
  // }

  @Post('packages')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async packageAwb(@Body() payload: PackagePayloadVm) {
    return this.packageService.awbPackage(payload);
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
