import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { SortationScanOutListService } from '../../../services/sortation/web/sortation-scanout-list.service';
import {
  ScanOutSortationBagDetailPayloadVm,
  ScanOutSortationRouteDetailPayloadVm,
} from '../../../models/sortation/web/sortation-scanout-list.payload.vm';
import { SortationScanOutImagePayloadVm } from '../../../models/sortation/web/sortation-scanout-payload.vm';

@ApiUseTags('Scan Out Sortation')
@Controller('sortation/scanOut')
export class SortationScanOutListController {
  @Post('list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public scanOutList(@Body() payload: BaseMetaPayloadVm) {
    return SortationScanOutListService.getScanOutSortationList(payload);
  }

  @Post('list/detailRoute')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public scanOutListDetailRoute(
    @Body() payload: ScanOutSortationRouteDetailPayloadVm,
  ) {
    return SortationScanOutListService.getScanOutSortationRouteDetail(payload);
  }

  @Post('list/detailBag')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public scanOutListDetailBag(
    @Body() payload: ScanOutSortationBagDetailPayloadVm,
  ) {
    return SortationScanOutListService.getScanOutSortationBagDetail(payload);
  }

  @Post('list/detailBag/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public scanOutListDetailMore(@Body() payload: BaseMetaPayloadVm) {
    return SortationScanOutListService.getScanOutSortationBagDetailMore(
      payload,
    );
  }

  @Post('history')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public scanOutDoSortationHistory(@Body() payload: BaseMetaPayloadVm) {
    return SortationScanOutListService.getHistory(payload);
  }

  @Post('image')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public FindscanOutImage(@Body() payload: SortationScanOutImagePayloadVm) {
    return SortationScanOutListService.getScanOutImages(payload);
  }

}
