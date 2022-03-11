import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { SortationScanOutListService } from '../../../services/sortation/web/sortation-scanout-list.service';

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
  public async scanOutListDetailRoute(@Body() payload: any) {
    console.log('asdf\n\n');
    return SortationScanOutListService.getScanOutSortationList(payload);
  }

  @Post('list/detailBag')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutListDetailBag(@Body() payload: any) {
    return null;
  }

  @Post('list/detailBag/more')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutListDetailMore(@Body() payload: any) {
    return null;
  }

  @Post('history')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutDoSortationHistory(@Body() payload: any) {
    return null;
  }

  @Post('image')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindscanOutImage(@Body() payload: any) {
    return null;
  }
}
