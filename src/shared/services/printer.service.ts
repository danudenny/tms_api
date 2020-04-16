import express = require('express');
import { size } from 'lodash';
import request = require('request');
import axios from 'axios';
import { ConfigService } from './config.service';
export class PrinterService {
  public static async responseForRawCommands({
    res,
    rawCommands,
    printerName,
    listPrinterName,
  }: {
    res: express.Response;
    rawCommands: string;
    printerName?: string;
    listPrinterName?: any;
  }) {
    if (listPrinterName) {
      for (let index = 0; index < listPrinterName.length; index++) {
        printerName = listPrinterName[index];
        const url = ConfigService.get('printerHelper.url');
        const options = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const payload = {
          type: 'raw',
          rawCommands,
          printerName,
        };
        const checkTmsPrinter = await axios.post(url, payload, options);

        // NOTE: check status tmsPrinter
        // post to printer endpoint
        if (
          checkTmsPrinter.status == 200 ||
          index == listPrinterName.length - 1
        ) {
          await this.responseForRawCommands({ res, rawCommands, printerName });
          break;
        }
      }
    } else {
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
  }
  public static async responseForJsReport({
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
    const payload: any = {};
    payload.type = 'jsreport';
    payload.printerName = printerName;
    payload.templates = templates;
    if (listPrinterName) {
      for (let index = 0; index < listPrinterName.length; index++) {
        payload.printerName = listPrinterName[index];
        const url = ConfigService.get('printerHelper.url');
        const options = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        // NOTE: check status tmsPrinter
        // post to printer endpoint
        const checkTmsPrinter = await axios.post(url, payload, options);

        if (
          checkTmsPrinter.status == 200 ||
          index == listPrinterName.length - 1
        ) {
          await this.responseForJsReport({ res, printerName, templates });
          break;
        }
      }
    } else {
      const reqTmsPrinter = request.post({
        url: ConfigService.get('printerHelper.url'),
        method: 'POST',
        json: payload,
      });
      reqTmsPrinter.pipe(res);
    }
  }
}
