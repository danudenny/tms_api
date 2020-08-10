import express = require('express');
import { PrinterService } from '../../../../shared/services/printer.service';
import { PrintCodTransferBranchVm } from '../../models/cod/web-awb-cod-response.vm';
import { PrintCodTransferBranchPayloadQueryVm } from '../../models/print/print-cod-transfer-branch-payload.vm';

export class PrintCodTransferBranchService {

  public static async printCashByRequest(
    res: express.Response,
    queryParams: PrintCodTransferBranchPayloadQueryVm,
  ) {
    // TODO: get data
    // this.printCashStore;
  }

  public static async printCashlessByRequest(
    res: express.Response,
    queryParams: PrintCodTransferBranchPayloadQueryVm,
  ) {
    // TODO: get data
    // this.printCashlessStore;
  }

  public static async printCashStore(
    res: express.Response,
    data: Partial<PrintCodTransferBranchVm>,
    printCopy: number = 1,
  ) {
    const templateConfig = {
      templateName: 'tanda-terima-cod-cash',
      printCopy,
    };
    return this.printCodTransfer(res, data, templateConfig);
  }

  public static async printCashlessStore(
    res: express.Response,
    data: Partial<PrintCodTransferBranchVm>,
    printCopy: number = 1,
  ) {
    const templateConfig = {
      templateName: 'tanda-terima-cod-cashless',
      printCopy,
    };
    return this.printCodTransfer(res, data, templateConfig);
  }

  // func private ============================================================
  private static async printCodTransfer(
    res: express.Response,
    data: Partial<PrintCodTransferBranchVm>,
    templateConfig: {
      templateName: string
      printCopy: number;
    },
  ) {
    const jsreportParams = data;
    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: templateConfig.templateName,
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
      listPrinterName,
    });
  }
}
