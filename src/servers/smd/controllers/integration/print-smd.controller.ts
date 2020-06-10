import { Controller, Query, Response, Get } from '@nestjs/common';
import express = require('express');
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import {ResponseSerializerOptions} from '../../../../shared/decorators/response-serializer-options.decorator';
import {SmdPrintService} from '../../services/integration/smd-print.service';
import {PrintSmdPayloadVm} from '../../models/print-smd-payload.vm';

@ApiUseTags('SMD printing')
@Controller('smd/print')
export class SmdPrintController {
  constructor() {}
  @Get('bagging')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printBagging(
    @Query() queryParams: PrintSmdPayloadVm,
    @Response() serverResponse: express.Response,
  ) {
    return SmdPrintService.printBagging(serverResponse, queryParams);
  }
}
