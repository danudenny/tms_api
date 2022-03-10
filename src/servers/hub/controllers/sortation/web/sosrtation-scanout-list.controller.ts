import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';

@ApiUseTags('Scan Out Sortation')
@Controller('sortation/scanOut')
export class SortationScanOutListController {
  constructor() {}

  @Post('list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutList(@Body() payload: any) {
    return null;
  }

  @Post('list/detailRoute')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutListDetailRoute(@Body() payload: any) {
    return null;
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

  @Post('monitoring/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async monitoringSortationList(@Body() payload: any) {
    return null;
  }
}
