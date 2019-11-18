import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebAwbFilterService } from '../../services/web/web-awb-filter.service';
import { WebAwbFilterScanBagVm, WebAwbFilterScanAwbVm, WebAwbFilterFinishScanVm } from '../../models/web-awb-filter.vm';
import { WebAwbFilterScanBagResponseVm, WebAwbFilterScanAwbResponseVm, WebAwbFilterFinishScanResponseVm, WebAwbFilterGetLatestResponseVm } from '../../models/web-awb-filter-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebAwbFilterListResponseVm } from '../../models/web-awb-filter-list.response.vm';
import { WebAwbSortirResponseVm } from '../../models/web-awb-sortir-response.vm';
import { BaseMetaSortirPayloadVm } from '../../../../shared/models/base-filter-search.payload.vm';

@ApiUseTags('Web Awb Filter')
@Controller('web/pod/awb/filter')
export class WebAwbFilterController {
  constructor(
    // private readonly bagRepository: BagRepository,
    private readonly webAwbFilterService: WebAwbFilterService,
  ) {}

  @Post('scanBag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbFilterScanBagResponseVm })
  public async scanBag(@Body() payload: WebAwbFilterScanBagVm) {
    return this.webAwbFilterService.scanBag(payload);
  }

  @Post('scanAwb')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbFilterScanAwbResponseVm })
  @Transactional()
  public async scanAwb(@Body() payload: WebAwbFilterScanAwbVm) {
    return this.webAwbFilterService.scanAwb(payload);
  }

  @Post('finishScan')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbFilterFinishScanResponseVm })
  @Transactional()
  public async finishScan(@Body() payload: WebAwbFilterFinishScanVm) {
    return this.webAwbFilterService.finishScan(payload);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbFilterListResponseVm })
  public async findAllAwbFilterList(@Body() payload: BaseMetaPayloadVm) {
    return this.webAwbFilterService.findAllAwbFilterList(payload);
  }

  @Post('loadScanFiltered')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbFilterGetLatestResponseVm })
  public async loadScanFiltered() {
    return this.webAwbFilterService.loadScanFiltered();
  }

  @Post('sortir')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbSortirResponseVm })
  public async findAllAwbSortirList(@Body() payload: BaseMetaSortirPayloadVm) {
    return this.webAwbFilterService.findAllAwbSortirList(payload);
  }

}
