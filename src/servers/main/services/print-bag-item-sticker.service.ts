import { PrinterService } from '../../../shared/services/printer.service';
import express = require('express');
import { PrintBagItemStickerDataVm } from '../models/print-bag-item-sticker.vm';
import { PrintBagItemPayloadQueryVm } from '../models/print-bag-item-payload.vm';
import { RepositoryService } from '../../../shared/services/repository.service';
import { RequestErrorService } from '../../../shared/services/request-error.service';
import { RawQueryService } from '../../../shared/services/raw-query.service';

export class PrintBagItemStickerService {
  public static async printBagItemStickerByRequest(
    res: express.Response,
    queryParams: PrintBagItemPayloadQueryVm,
  ) {
    const q = RepositoryService.bagItem.findOne();
    q.innerJoin(e => e.bag);
    q.leftJoin(e => e.bag.district);

    const data = await q
      .select({
        bagItemId: true,
        bagId: true,
        bagSeq: true,
        weight: true,
        bag: {
          bagId: true,
          bagNumber: true,
          branchTo: {
            branchName: true,
            branchCode: true,
          },
        },
      })
      .where(e => e.bagItemId, w => w.equals(queryParams.id))
      .andWhere(e => e.bag.isDeleted, w => w.isFalse());

    if (!data) {
      RequestErrorService.throwObj({
        message: 'Gabung paket tidak ditemukan',
      });
    }

    let newBagSeq = data.bagSeq.toString();
    if (data.bagSeq.toString().length < 3) {
      newBagSeq = '0'.repeat(3 - data.bagSeq.toString().length) + newBagSeq;
    }
    data.bag.bagNumber = data.bag.bagNumber + newBagSeq;

    const [{ cnt: bagItemAwbsTotal }] = await RawQueryService.exec(
      `SELECT COUNT(1) as cnt FROM bag_item_awb WHERE bag_item_id=:bagItemId`,
      { bagItemId: data.bagItemId },
    );

    return this.printBagItemSticker(res, data as any, {
      bagItemAwbsTotal,
    });
  }

  public static async printBagItemSticker(
    res: express.Response,
    data: Partial<PrintBagItemStickerDataVm>,
    meta: {
      bagItemAwbsTotal: number;
    },
  ) {
    const weightNumberOnly = `${data.weight}`
      .replace(/\D/gm, '')
      .substring(0, 5);
    const finalWeightRounded2Decimal = parseFloat(`${data.weight}`).toFixed(2);
    const finalBagItemSeq = String(data.bagSeq).padStart(3, '0');
    const finalBagItemBarcodeNumber = `${
      data.bag.bagNumber
    }${weightNumberOnly}`;
    const branchCode = data.bag.branch.branchCode
      ? data.bag.branch.branchCode
      : data.bag.branchTo.branchCode;
    const branchName = data.bag.branch.branchName
      ? data.bag.branch.branchName
      : data.bag.branchTo.branchName;
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
      `TEXT 30,420,"3",0,1,1,"Berat : ${finalWeightRounded2Decimal} Isi : ${
        meta.bagItemAwbsTotal
      } resi"\n` +
      `TEXT 30,460,"4",0,1,1,0,"${branchCode}"\n` +
      `TEXT 30,510,"5",0,1,1,0,"${branchName}"\n` +
      `PRINT 1\n` +
      `EOP`;

    const printerName = 'BarcodePrinter';
    PrinterService.responseForRawCommands({
      res,
      rawCommands: rawTsplPrinterCommands,
      printerName,
    });
  }
}
