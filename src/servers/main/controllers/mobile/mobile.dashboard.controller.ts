import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { awbRepository } from '../../../../shared/orm-repository/MobileDelivery.repository';
import { MobileDashboardFindAllResponseVm } from '../../models/MobileDashboard.response.vm';
import { MobiledashboardVm } from '../../models/MobileDashboard.vm';

@ApiUseTags('Dashboard')
@Controller('api/mobile')
export class MobileDashboardController {
  constructor(
    private readonly AwbRepository: awbRepository,
  ) { }

  @Post('dashboard')
  @ApiOkResponse({ type: MobileDashboardFindAllResponseVm })
  public async Dashboard(@Body() payload: MobiledashboardVm) {
    const Dashboard = await this.AwbRepository.create(
      // payload.clientId,
    );

    return Dashboard;
  }
}