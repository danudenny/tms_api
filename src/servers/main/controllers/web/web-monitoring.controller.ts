import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BagMonitoringPayloadVm } from '../../models/bag-monitoring-payload.vm';
import { BagMonitoringResponseVm } from '../../models/bag-monitoring-response.vm';
import { WebMonitoringService } from '../../services/web/web-monitoring.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebMonitoringCoordinatorService } from '../../services/web/web-monitoring-coordinator.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebMonitoringCoordinatorResponse, WebMonitoringCoordinatorTaskResponse, WebMonitoringCoordinatorPhotoResponse, WebMonitoringCoordinatorListResponse } from '../../models/web-monitoring-coordinator.response.vm';
import { WebMonitoringCoordinatorTaskPayload, WebMonitoringCoordinatorPhotoPayload } from '../../models/web-monitoring-coordinator-payload.vm';

@ApiUseTags('Web Monitoring')
@Controller('web/monitoring')
export class WebMonitoringController {
  @Post('bagIn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: BagMonitoringResponseVm })
  public async troubledList(@Body() payload: BagMonitoringPayloadVm) {
    return WebMonitoringService.findAllByRequest(payload);
  }

  @Post('coordinator/branch')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorResponse })
  public async monitoringCoordinatorList(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListAll(payload);
  }

  @Post('coordinator')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorListResponse })
  public async monitoringCoordinator(@Body() payload: BaseMetaPayloadVm) {
    return WebMonitoringCoordinatorService.findListCoordinator(payload);
  }

  @Post('coordinator/task')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorTaskResponse })
  public async monitoringCoordinatorListTask(@Body() payload: WebMonitoringCoordinatorTaskPayload) {
    return WebMonitoringCoordinatorService.listTask(payload);
  }

  @Post('coordinator/task/photo')
  @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebMonitoringCoordinatorPhotoResponse })
  public async monitoringCoordinatorTaskPhoto(@Body() payload: WebMonitoringCoordinatorPhotoPayload) {
    return WebMonitoringCoordinatorService.taskPhoto(payload);
  }
}
