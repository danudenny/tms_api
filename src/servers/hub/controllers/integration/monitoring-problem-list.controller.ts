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
  public async getDoHubV2(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getDoHubV2(payload);
  }

  @Post('problem/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getTotalEachStatusV2(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbProblemV2(payload);
  }

  @Post('manual/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getAwbManualSortirV2(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbManualSortirV2(payload);
  }

  @Post('machine/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getAwbMachineSortirV2(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbMachineSortirV2(payload);
  }

  @Post('scan-out/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getScanOutListV2(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbScanOutV2(payload);
  }

  @Post('not-scan-out/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubProblemVm })
  public async getNotScanOutList(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbNotScanOutV2(payload);
  }

  @Post('total/list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MonitoringHubTotalProblemVm })
  public async getAwbtotalSortirV2(@Body() payload: BaseMetaPayloadVm) {
    return MonitoringProblemListService.getAwbtotalSortirV2(payload);
  }
}
