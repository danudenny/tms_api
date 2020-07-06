import { Body, Controller, Post, Req, UseGuards, Query, Get, Response} from '@nestjs/common';
import { ScaninSmdService } from '../../services/integration/scanin-smd.service';
import { MonitoringSmdServices } from '../../services/integration/monitoring-smd-list.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ScanInSmdPayloadVm } from '../../models/scanin-smd.payload.vm';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MonitoringPayloadVm, StoreExcelMonitoringPayloadVm } from '../../models/smd-monitoring-payload.vm';
import express = require('express');
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Monitoring SMD')
@Controller('monitoring')
export class MonitoringSmdController {
  constructor() {}

  @Post('smd/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async FindDetailscanInList(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return MonitoringSmdServices.monitoringSmdList(payload);
  }

  @Post('smd/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: StoreExcelMonitoringPayloadVm) {
    return MonitoringSmdServices.storeExcelPayload(payloadBody);
  }

  @Get('smd/export/excel')
  public async exportExcel(
    @Query() queryParams: MonitoringPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return MonitoringSmdServices.exportExcel(serverResponse, queryParams);
  }

}
