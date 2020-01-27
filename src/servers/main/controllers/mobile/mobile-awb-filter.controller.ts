import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors, Get } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from 'src/shared/models/base-meta-payload.vm';
import { MobileAwbFilterListResponseVm } from '../../models/mobile-awb-filter-list.response.vm';
import { MobileAwbFilterService } from '../../services/mobile/mobile-awb-filter.service';

@ApiUseTags('Mobile Transit Detail Awb List')
@Controller('mobile')
export class MobileAwbFilterController {
  constructor(private readonly mobileAwbFilterService: MobileAwbFilterService) {}

  @Get('pod/scanIn/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbScanInFilterList() {
    return this.mobileAwbFilterService.findAllScanInFilterList();
  }

  @Get('pod/notScanIn/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbNotScanInFilterList() {
    return this.mobileAwbFilterService.findAllNotScanInFilterList();
  }

  @Get('pod/notScanOut/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbNotScanOutFilterList() {
    return this.mobileAwbFilterService.findAllNotScanOutFilterList();
  }
}
