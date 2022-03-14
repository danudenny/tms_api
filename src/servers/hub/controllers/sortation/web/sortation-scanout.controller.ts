import { Body, Controller, Delete, Param, Post, UseGuards} from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { SortationScanOutBagsPayloadVm, SortationScanOutRoutePayloadVm, SortationScanOutVehiclePayloadVm } from '../../../models/sortation/web/sortation-scanout-payload.vm';
import { SortationScanOutBagsResponseVm, SortationScanOutRouteResponseVm, SortationScanOutVehicleResponseVm } from '../../../models/sortation/web/sortation-scanout-response.vm';
import { SortationScanOutService } from '../../../services/sortation/web/sortation-scanout.service';

@ApiUseTags('Scan Out Sortation')
@Controller('sortation/scanOut')
export class SortationScanOutController {
  constructor() {}

  @Post('vehicle')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SortationScanOutVehicleResponseVm })
  public async scanOutVehicle(@Body() payload: SortationScanOutVehiclePayloadVm) {
    return SortationScanOutService.sortationScanOutVehicle(payload);
  }

  @Post('route')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SortationScanOutRouteResponseVm })
  public async scanOutRoute(@Body() payload: SortationScanOutRoutePayloadVm) {
    return SortationScanOutService.sortationScanOutRoute(payload);
  }

  @Post('bags')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SortationScanOutBagsResponseVm })
  public async scanOutBags(@Body() payload: SortationScanOutBagsPayloadVm) {
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
