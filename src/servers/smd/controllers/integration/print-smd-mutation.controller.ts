import { ApiBearerAuth, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Body, Controller, Get, Post, Query, Response, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { SmdPrintService } from '../../services/integration/smd-print.service';
import { PrintReceivedBagPaperPayloadVm, PrintSmdMutation } from '../../models/print-smd-payload.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import express = require('express');
import { ResponseMaintenanceService } from '../../../../shared/services/response-maintenance.service';
import { InsertDoMutationStatusPayloadVm } from '../../models/do-mutation.payload.vm';
import { DoMutationService } from '../../services/integration/do-mutation.service';

@ApiUseTags('SMD printing')
@Controller('smd/mutation/print')
export class PrintSmdMutationController {
  constructor() {}
  @Post('store')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async storeSmdMutationPrint(@Body() body: PrintSmdMutation) {
    return SmdPrintService.storeSmdMutationPrint(body);
  }

  @Post('detail')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async detailSmdMutationPrint(@Body() body: InsertDoMutationStatusPayloadVm) {
    return DoMutationService.detailSmdMutationPrint(body);
  }

  @Get('execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({disable: true})
  public async executeSmdMutationPrint(
    @Query() params: PrintReceivedBagPaperPayloadVm,
    @Response() response: express.Response,
  ) {
    await ResponseMaintenanceService.userIdNotNull(params.userId);
    return SmdPrintService.executeSmdMutationPrint(response, params);
  }
}
