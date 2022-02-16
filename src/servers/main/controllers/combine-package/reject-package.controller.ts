import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { V1PackageService } from '../../services/combine-package/v1/package.services';
import { RejectPackagePayloadVm } from '../../models/reject-package-payload.vm';


@ApiUseTags('Rejected Sorting Machine Packages')
@Controller('reject')
export class RejectPackageController {
  @Post('packages')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async rejectPackage(@Body() payload: RejectPackagePayloadVm) {
    return V1PackageService.awbPackage(payload);
  }
}