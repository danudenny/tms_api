import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from 'src/shared/models/base-meta-payload.vm';
import { MobileAwbFilterListResponseVm } from '../../models/mobile-awb-filter-list.response.vm';
import { MobileAwbFilterService } from '../../services/mobile/mobile-awb-filter.service';

@ApiUseTags('Mobile Delivery In')
@Controller('mobile')
export class MobileAwbFilterController {
  constructor(private readonly mobileAwbFilterService: MobileAwbFilterService) {}

  @Post('pod/scanIn/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbScanInFilterList(@Body() payload: BaseMetaPayloadVm) {
    return this.mobileAwbFilterService.findAllScanInFilterList(payload);
  }

  @Post('pod/notScanIn/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbNotScanInFilterList(@Body() payload: BaseMetaPayloadVm) {
    return this.mobileAwbFilterService.findAllNotScanInFilterList(payload);
  }

  @Post('pod/notScanOut/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbNotScanOutFilterList(@Body() payload: BaseMetaPayloadVm) {
    return this.mobileAwbFilterService.findAllNotScanOutFilterList(payload);
  }
}
