import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { DashboardService } from '../../services/mobile/dashboard.service';
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { MobileDashboardFindAllResponseVm } from '../../models/mobile-dashboard.response.vm';
import { MobiledashboardVm } from '../../models/mobile-dashboard.vm';
import { WebDeliveryFilterPayloadVm } from '../../models/web-delivery.vm';

@ApiUseTags('Dashboard')
@Controller('api/mobile')
export class MobileDashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) { }

  @Post('dashboard')
  @ApiBearerAuth()
  @ApiOkResponse({ type: MobileDashboardFindAllResponseVm })
  public async findalldashboard() {
    return this.dashboardService.findalldashboard();
    }
  }
