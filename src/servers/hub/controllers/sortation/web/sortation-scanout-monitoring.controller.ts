import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { SortationScanOutListService } from '../../../services/sortation/web/sortation-scanout-list.service';

@ApiUseTags('Scan Out Sortation Monitoring')
@Controller('monitoring')
export class SortationScanOutMonitoringController {
  @Post('sortation/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutSortationList(@Body() payload: BaseMetaPayloadVm) {
    return SortationScanOutListService.getMonitoringList(payload);
  }
}
