import { PrinterService } from '../../../shared/services/printer.service';
import express = require('express');
import { PrintBagItemStickerDataVm } from '../models/print-bag-item-sticker.vm';

export class PrintBagItemStickerService {
  public static async printBagItemSticker(
    res: express.Response,
    data: Partial<PrintBagItemStickerDataVm>,
    meta: {
      bagItemsTotal: number,
    },
  ) {
    const weightNumberOnly = `${data.weight}`.replace(/\D/gm, '').substring(0, 5);
    const finalWeightRounded2Decimal = parseFloat(`${data.weight}`).toFixed(
      2,
    );
    const finalBagItemSeq = String(data.bagSeq).padStart(3, '0');
    const finalBagItemBarcodeNumber = `${
      data.bag.bagNumber
    }${finalBagItemSeq}${weightNumberOnly}`;
    const rawTsplPrinterCommands =
      `SIZE 80 mm, 100 mm\n` +
      `SPEED 3\n` +
      `DENSITY 8\n` +
      `DIRECTION 0\n` +
      `OFFSET 0\n` +
      `CLS\n` +
      `TEXT 30,120,"5",0,1,1,0,"GABUNGAN SORTIR"\n` +
      `BARCODE 30,200,"128",100,1,0,3,10,"${finalBagItemBarcodeNumber}"\n` +
      `TEXT 30,380,"3",0,1,1,"Koli ke : ${finalBagItemSeq}"\n` +
      `TEXT 30,420,"3",0,1,1,"Berat : ${finalWeightRounded2Decimal} Isi : ${meta.bagItemsTotal} resi"\n` +
      `TEXT 30,460,"4",0,1,1,0,"${
        data.bag.district.districtCode
      }"\n` +
      `TEXT 30,510,"5",0,1,1,0,"${
        data.bag.district.districtName
      }"\n` +
      `PRINT 1\n` +
      `EOP`;

    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawTsplPrinterCommands,
      printerName: 'BarcodePrinter',
    });
  }
}
