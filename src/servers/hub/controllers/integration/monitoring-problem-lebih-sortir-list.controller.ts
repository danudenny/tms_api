import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import {
    ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MonitoringHubProblemLebihSortirVm, MonitoringHubProblemVm } from '../../models/monitoring-hub-problem.vm';
import { MonitoringProblemLebihSortirListService } from '../../services/integration/monitoring-problem-lebih-sortir-list.service';

@ApiUseTags('Monitoring Problem')
@Controller('monitoring-hub')
export class MonitoringProblemLebihSortirListController {
  constructor() {}

  @Post('lebih-sortir/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getLebihSortir(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemLebihSortirListService.getLebihSortir(payload);
  }

  @Post('lebih-sortir-total/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemLebihSortirVm })
  public async getAwbtotalLebihSortir(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemLebihSortirListService.getAwbtotalLebihSortir(payload);
  }
}
