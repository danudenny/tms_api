// #region import
import { Controller, Post, Body, HttpCode, HttpStatus, Res, Query, Response, Get } from '@nestjs/common';
import express = require('express');
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { BagRepresentativeTrackingDetailAwbVm } from '../../../smd/models/bag-representative-tracking-detail-awb.vm';
import { TrackingDeliveryOutService } from '../../services/pod/tracking-delivery-out.service';
import { WebScanOutReportVm } from '../../../main/models/web-scan-out-response.vm';
// #endregion

@ApiUseTags('SMD Bag City Report')
@Controller('web/tracking')
export class TrackingDeliveryOutController {
  constructor() {}
  @Post('bagRepresentativeDetail/excel/payload')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: WebScanOutReportVm })
  public async storeExcelPayload(
    @Body() payload: BagRepresentativeTrackingDetailAwbVm,
  ) {
    return await TrackingDeliveryOutService.storeExcelPayload(
      payload,
    );
  }

  @Get('bagRepresentativeDetail/excel/export')
  public async exportBagRepresentativeDetail(
    @Query() queryParams: WebScanOutReportVm,
    @Response() serverResponse: express.Response,
  ) {
    return await TrackingDeliveryOutService.exportBagRepresentativeDetail(
      serverResponse,
      queryParams,
    );
  }
}
