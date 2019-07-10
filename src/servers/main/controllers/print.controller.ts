import { Controller, Get, Query, Response } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';
import express = require('express');

import { WebClientPrintService } from '../../../shared/services/web-client-print.service';
import { PrintDoPodPayloadQueryVm } from '../models/print-do-pod-payload.vm';

@ApiUseTags('General')
@Controller('print')
export class PrintController {
  @Get('dopod')
  @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  public async printDoPod(
    @Query() queryParams: PrintDoPodPayloadQueryVm,
    @Response() serverResponse: { res: express.Response },
  ) {
    WebClientPrintService.sendPrinterCommands(
      serverResponse.res,
`SURAT JALAN
Gerai Daan Mogot
------------------------------------------
Tanggal
15/05/2019

ADMIN
Ajeng Aulia - 19010060
------------------------------------------
DRIVER
Sugi - 19010021
------------------------------------------

No Surat Jalan
DOP/1907/00008

000185133162
000185133162
000185133162
000185133162
000185133162
000185133162

------------------------------------------
TOTAL PAKET: 8

TTD PENERIMA`,
    );
  }
}
