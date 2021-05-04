import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import {
    ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MonitoringProblemListService } from '../../services/integration/monitoring-problem-list.service';
import { MonitoringHubProblemVm, MonitoringHubTotalProblemVm } from '../../models/monitoring-hub-problem.vm';

@ApiUseTags('Monitoring Problem')
@Controller('monitoring-hub')
export class MonitoringProblemListController {
  constructor() {}

  @Post('do-hub/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getDoHub(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getDoHub(payload);
  }

  @Post('problem/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getTotalEachStatus(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbProblem(payload);
  }

  @Post('manual/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getAwbManualSortir(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbManualSortir(payload);
  }

  @Post('machine/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getAwbMachineSortir(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbMachineSortir(payload);
  }

  @Post('lebih-sortir/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getLebihSortir(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getLebihSortir(payload);
  }

  @Post('total/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubTotalProblemVm })
  public async getAwbtotalSortir(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbtotalSortir(payload);
  }
}
