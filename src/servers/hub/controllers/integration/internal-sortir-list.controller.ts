import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import {
    ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { ListBranchSortirLogVm, DetailBranchSortirLogVm } from '../../models/internal-sortir-list.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { InternalSortirListService } from '../../services/integration/internal-sortir-list.service';

@ApiUseTags('Internal Sortir Log')
@Controller('internal/sortir-log/old')
export class InternalSortirListController {
  constructor() {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ListBranchSortirLogVm })
  public async getListLogSortir(@Body() payload: BaseMetaPayloadVm) {
    return InternalSortirListService.getListLogSortir(payload);
  }

  @Post('detail')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DetailBranchSortirLogVm })
  public async getDetailLogSortir(@Body() payload: BaseMetaPayloadVm) {
    return InternalSortirListService.getDetailLogSortir(payload);
  }
}
