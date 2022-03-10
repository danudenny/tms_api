import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';

@ApiUseTags('Scan Out Sortation')
@Controller('sortation/scanOut')
export class SortationScanOutController {
  constructor() {}

  @Post('vehicle')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutVehicle(@Body() payload: any) {
    return null;
  }

  @Post('route')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutRoute(@Body() payload: any) {
    return null;
  }

  @Post('bags')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutBags(@Body() payload: any) {
    return null;
  }

  @Post('loadDoSortation')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutLoadDoSortation(@Body() payload: any) {
    return null;
  }

  @Post('done')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutDone(@Body() payload: any) {
    return null;
  }

  @Delete('deleted/:id')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async deleteDoSortation(@Param('id') doSortationId: string) {
    return null;
  }

}
