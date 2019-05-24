import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AwbRepository } from '../../../../shared/orm-repository/mobile-delivery.repository';
import { MobileDashboardFindAllResponseVm } from '../../models/mobile-dashboard.response.vm';
import { MobiledashboardVm } from '../../models/mobile-dashboard.vm';

@ApiUseTags('Dashboard')
@Controller('api/mobile')
export class MobileDashboardController {
  constructor(
    private readonly awbRepository: AwbRepository,
  ) { }

  @Post('dashboard')
  @ApiOkResponse({ type: MobileDashboardFindAllResponseVm })
  public async Dashboard(@Body() payload: MobiledashboardVm) {
    const Dashboard = await this.awbRepository.create(
      // payload.clientId,
    );

    return Dashboard;
  }
}