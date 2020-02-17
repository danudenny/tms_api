import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors, Get } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileAwbFilterListResponseVm } from '../../models/mobile-awb-filter-list.response.vm';
import { MobileAwbFilterService } from '../../services/mobile/mobile-awb-filter.service';
import { DetailTransitPayloadVm } from '../../models/mobile-dashboard.vm';

@ApiUseTags('Mobile Transit Detail Awb List')
@Controller('mobile')
export class MobileAwbFilterController {
  constructor(private readonly mobileAwbFilterService: MobileAwbFilterService) {}

  @Get('pod/scanIn/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbScanInFilterList( @Body() payload: DetailTransitPayloadVm ) {
    return this.mobileAwbFilterService.findAllScanInFilterList(payload);
  }

  @Get('pod/notScanIn/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbNotScanInFilterList( @Body() payload: DetailTransitPayloadVm ) {
    return this.mobileAwbFilterService.findAllNotScanInFilterList(payload);
  }

  @Get('pod/notScanOut/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileAwbFilterListResponseVm })
  public async findAllAwbNotScanOutFilterList( @Body() payload: DetailTransitPayloadVm ) {
    return this.mobileAwbFilterService.findAllNotScanOutFilterList(payload);
  }
}
