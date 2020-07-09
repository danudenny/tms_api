import { Body, Controller, Post, Query, Response, Get } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ScanoutSmdExportService } from '../../services/integration/scanout-smd-export.service';
import express = require('express');
import { StoreExcelScanOutPayloadVm } from '../../models/scanout-smd.payload.vm';

@ApiUseTags('SCAN OUT EXPORT SMD')
@Controller('smd')
export class ScanOutExportController {
  constructor() {}

  @Post('scanOut/excel/store')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async storePayloadExcel(@Body() payloadBody: BaseMetaPayloadVm) {
    return ScanoutSmdExportService.storeExcelPayload(payloadBody);
  }

  @Get('scanOut/export/excel')
  public async exportExcel(
    @Query() queryParams: StoreExcelScanOutPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return ScanoutSmdExportService.exportExcel(serverResponse, queryParams);
  }

}
