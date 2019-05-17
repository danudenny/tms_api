import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { awbRepository } from '../../../../shared/orm-repository/MobileDelivery.repository';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { MobileDashboardFindAllResponseVm } from '../../models/MobileDashboard.response.vm';
import { MobiledashboardVm } from '../../models/MobileDashboard.vm';
const logger = require('pino')();

@ApiUseTags('Mobile Delivery')
@Controller('api/mobile/dashboard')
export class MobileDashboardController {
  constructor(
    private readonly AwbRepository: awbRepository,
  ) { }

 
  @Post()
  @ApiOkResponse({ type: MobileDashboardFindAllResponseVm })
  public async Dashboard(@Body() payload: MobiledashboardVm) {
    const Dashboard = await this.AwbRepository.create(
      // payload.clientId,
    );

    return Dashboard;
  }
  
}