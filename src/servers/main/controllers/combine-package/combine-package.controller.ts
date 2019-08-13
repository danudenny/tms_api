import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { GabunganPayloadVm, PackagePayloadVm } from '../../models/gabungan-payload.vm';
import { GabunganFindAllResponseVm, PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { GabunganService } from '../../services/combine-package/gabungan.services';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Resi Bag')
@Controller('combine')
export class GabunganController {
  constructor(private readonly gabunganService: GabunganService) {}

  @Post('bag')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: GabunganFindAllResponseVm })
  public async gabunganAwb(@Body() payload: GabunganPayloadVm) {

    return this.gabunganService.gabunganAwb(payload);
  }

  @Post('packages')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PackageAwbResponseVm })
  public async packageAwb(@Body() payload: PackagePayloadVm) {

    return this.gabunganService.awbPackage(payload);
  }

}
