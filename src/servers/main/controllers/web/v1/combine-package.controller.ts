import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { PackageAwbResponseVm } from '../../../models/gabungan.response.vm';
import { PackagePayloadVm } from '../../../models/gabungan-payload.vm';
import { V1PackageService } from '../../../services/combine-package/v1/package.services';
import { UnloadAwbPayloadVm } from '../../../models/package-payload.vm';

@ApiUseTags('Gabungan Sortir')
@Controller('web/v1/combine')
@ApiBearerAuth()
export class V1CombinePackageController {
  constructor() {}

  @Post('packages')
  @HttpCode(200)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async packageAwb(@Body() payload: PackagePayloadVm) {
    return V1PackageService.awbPackage(payload);
  }

  @Post('loadPackages')
  @HttpCode(200)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async loadPackageAwb() {
    return V1PackageService.loadAwbPackage();
  }

  @Post('unload/awb')
  @HttpCode(200)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async unloadAwb(@Body() payload: UnloadAwbPayloadVm) {
    return V1PackageService.unloadAwb(payload);
  }
}
