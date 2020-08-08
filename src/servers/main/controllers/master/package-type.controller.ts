import { Controller, Post, UseGuards, HttpCode, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { PackageTypeService } from '../../services/master/package-type.service';
import { PackageTypeResponseVm } from '../../models/master/package-type.vm';

@ApiUseTags('Master Data')
@Controller('master/packageType')
export class PackageTypeController {
  constructor() {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PackageTypeResponseVm })
  public async listData(@Body() payload: BaseMetaPayloadVm) {
    return PackageTypeService.listData(payload);
  }
}
