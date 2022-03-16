import express from 'express';
import { Controller, Query, Response, Get } from '@nestjs/common';
import {
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../../shared/decorators/response-serializer-options.decorator';
import { PrintDoSortationPayloadQueryVm } from '../../../models/sortation/web/print-do-sortation-payload.vm';
import { ResponseMaintenanceService } from '../../../../../shared/services/response-maintenance.service';
import { SortationPrintService } from '../../../services/sortation/web/sortation-print.service';

@ApiUseTags('Sortation printing')
@Controller('sortation/print')
export class SortationPrintController {
  @Get('do-sortation')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoSmd(
    @Query() queryParams: PrintDoSortationPayloadQueryVm,
    @Response() res: express.Response,
  ) {
    await ResponseMaintenanceService.userIdNotNull(queryParams.userId);
    return SortationPrintService.printDoSortationByRequest(res, queryParams);
  }
}
