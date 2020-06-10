import express = require('express');
import {RepositoryService} from '../../../../shared/services/repository.service';
import {RequestErrorService} from '../../../../shared/services/request-error.service';
import {PrinterService} from '../../../../shared/services/printer.service';
import {PrintSmdPayloadVm} from '../../models/print-smd-payload.vm';

export class SmdPrintService {
  public static async printBagging(
    res: express.Response,
    queryParams: PrintSmdPayloadVm,
  ) {
    const bagging = await RepositoryService.baggingSmd
      .loadById(queryParams.id)
      .select({
        baggingId: true, // needs to be selected due to users relations are being included
        baggingCode: true,
        totalItem: true,
        totalWeight: true,
        representative: {
          representativeCode: true,
          representativeName: true,
        },
      })
      .exec();

    if (!bagging) {
      RequestErrorService.throwObj({
        message: 'Bagging tidak ditemukan',
      });
    }

    const rawPrinterCommands =
      `SIZE 80 mm, 100 mm\n` +
      `SPEED 3\n` +
      `DENSITY 8\n` +
      `DIRECTION 0\n` +
      `OFFSET 0\n` +
      `CLS\n` +
      `TEXT 30,120,"5",0,1,1,0,"BAGGING"\n` +
      `BARCODE 30,200,"128",100,1,0,3,10,"${bagging.baggingCode}"\n` +
      `TEXT 30,380,"3",0,1,1,"Jumlah koli : ${bagging.totalItem}"\n` +
      `TEXT 30,420,"3",0,1,1,"Berat : ${bagging.totalWeight}"\n` +
      `TEXT 30,460,"5",0,1,1,0,"${bagging.representative.representativeCode}"\n` +
      `PRINT 1\n` +
      `EOP`;

    const listPrinterName = ['StrukPrinter', 'BarcodePrinter'];
    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawPrinterCommands,
      listPrinterName,
    });
  }
}
