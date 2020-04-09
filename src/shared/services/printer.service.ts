import express = require('express');
import { size } from 'lodash';
import request = require('request');

import { ConfigService } from './config.service';

export class PrinterService {
  public static responseForRawCommands({
    res,
    rawCommands,
    printerName,
  }: {
    res: express.Response;
    rawCommands: string;
    printerName?: string;
  }) {
    const reqTmsPrinter = request.post({
      url: ConfigService.get('printerHelper.url'),
      method: 'POST',
      json: {
        type: 'raw',
        rawCommands,
        printerName,
      },
    });
    reqTmsPrinter.pipe(res);
  }

  public static responseForJsReport({
    res,
    printerName,
    templates,
    listPrinterName,
  }: {
    res: express.Response;
    printerName?: string;
    templates: Array<{
      templateName: string;
      templateData?: any;
      printCopy?: number;
    }>;
    listPrinterName?: any;
  }) {
    if (listPrinterName) {
      listPrinterName.forEach((name, index) => {
        const payload: any = {};
        payload.type = 'jsreport';
        payload.printerName = name;
        payload.templates = templates;

        const reqTmsPrinter = request.post({
          url: ConfigService.get('printerHelper.url'),
          method: 'POST',
          json: payload,
        });
        const end = index === listPrinterName.length - 1 ? true : false;
        reqTmsPrinter.pipe(
          res,
          { end },
        );
      });
    } else {
      const payload: any = {};
      payload.type = 'jsreport';
      payload.printerName = printerName;
      payload.templates = templates;

      const reqTmsPrinter = request.post({
        url: ConfigService.get('printerHelper.url'),
        method: 'POST',
        json: payload,
      });
      reqTmsPrinter.pipe(res);
    }
  }
}
