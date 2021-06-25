import { Body, Controller, Post, Query, Get, Response } from '@nestjs/common';
import express = require('express');

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { SmdScaninReportService } from '../../services/smd/smd-scanin-report.service';
import { ScanOutSmdScanInReportVm } from '../../../smd/models/scanin-smd.response.vm';
import { SmdBagCityReportService } from '../../services/smd/smd-bag-city-report.service';
import {BagCityReportVm} from '../../../smd/models/bag-city-report.vm';

@ApiUseTags('SMD Bag City Report')
@Controller('smd')
export class SmdBagCityReportController {
  constructor() {}

  @Post('bag-city/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: BagCityReportVm })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return SmdBagCityReportService.storeExcelPayload(payloadBody);
  }

  @Get('bag-city/excel/export')
  public async exportExcelBranch(
    @Query() queryParams: BagCityReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdBagCityReportService.generateBagCityCSV(serverResponse, queryParams);
  }
}
