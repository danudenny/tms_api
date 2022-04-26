import { Body, Controller, Delete, Param, Post, UseGuards} from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { SortationChangeVehiclePayloadVm, SortationScanOutBagsPayloadVm, SortationScanOutDonePayloadVm, SortationScanOutLoadPayloadVm, SortationScanOutRoutePayloadVm, SortationScanOutVehiclePayloadVm } from '../../../models/sortation/web/sortation-scanout-payload.vm';
import { SortationChangeVehicleResponseVm, SortationScanOutBagsResponseVm, SortationScanOutDoneResponseVm, SortationScanOutLoadResponseVm, SortationScanOutRouteResponseVm, SortationScanOutVehicleResponseVm } from '../../../models/sortation/web/sortation-scanout-response.vm';
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
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SortationScanOutBagsResponseVm })
  public async scanOutBags(@Body() payload: SortationScanOutBagsPayloadVm) {
    return SortationScanOutService.sortationScanOutBags(payload);
  }

  @Post('loadDoSortation')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SortationScanOutLoadResponseVm })
  public async scanOutLoadDoSortation(@Body() payload: SortationScanOutLoadPayloadVm) {
    return SortationScanOutService.sortationScanOutLoadDoSortation(payload);
  }

  @Post('done')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SortationScanOutDoneResponseVm })
  public async scanOutDone(@Body() payload: SortationScanOutDonePayloadVm) {
    return SortationScanOutService.sortationScanOutDone(payload);
  }

  @Delete('deleted/:id')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async deleteDoSortation(@Param('id') doSortationId: string) {
    await SortationScanOutService.sortaionScanOutDeleted(doSortationId);

    return {
      message: 'Sortation ID: ' + doSortationId + ' Deleted' ,
      statusCode: 200,
      data: [],
    };
  }

  @Delete('route/deleted/:id')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async deleteDoSortationRoute(@Param('id') doSortationDetailId: string) {
    await SortationScanOutService.sortationScanOutRouteDelete(doSortationDetailId);

    return {
      message: 'Sortation Detail ID: ' + doSortationDetailId + ' Deleted' ,
      statusCode: 200,
      data: [],
    };
  }


  @Post('changeVehicle')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SortationChangeVehicleResponseVm })
  public async changeVehicle(@Body() payload: SortationChangeVehiclePayloadVm) {
    return SortationScanOutService.changeVehicle(payload);
  }
}
