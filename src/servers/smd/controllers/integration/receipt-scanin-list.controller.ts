import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ReceiptScaninListService } from '../../services/integration/receipt-scanin-list.service';
import { ReceiptScaninListResponseVm, ReceiptScaninDetailListResponseVm } from '../../models/receipt-scanin-list.response.vm';

@ApiUseTags('RECEIPT SCAN IN List SMD')
@Controller('smd/receipt')
export class ReceiptScaninListController {
  constructor() {}

  @Post('scanIn/list')
  @ApiOkResponse({type: ReceiptScaninListResponseVm})
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async findReceiptScanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ReceiptScaninListService.findReceiptScanInList(payload);
  }

  @Post('scanIn/detail')
  @ApiOkResponse({type: ReceiptScaninDetailListResponseVm})
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async findReceiptScanInDetailList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return ReceiptScaninListService.findReceiptScanInDetailList(payload);
  }
}
