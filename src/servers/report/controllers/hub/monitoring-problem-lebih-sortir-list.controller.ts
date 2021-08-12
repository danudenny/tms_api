import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
    ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MonitoringHubProblemLebihSortirVm, MonitoringHubProblemVm } from '../../models/monitoring-hub-problem.vm';
import { MonitoringProblemLebihSortirListService } from '../../services/hub/monitoring-problem-lebih-sortir-list.service';

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

  @Post('lebih-sortir-old/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getLebihSortirOld(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemLebihSortirListService.getLebihSortirOld(payload);
  }

  @Post('lebih-sortir-total-old/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemLebihSortirVm })
  public async getAwbtotalLebihSortirOld(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemLebihSortirListService.getAwbtotalLebihSortirOld(payload);
  }
}
