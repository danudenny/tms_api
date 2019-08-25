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
    jsreportTemplateName,
    jsreportTemplateData,
    printerName,
  }: {
    res: express.Response;
    jsreportTemplateName: string;
    jsreportTemplateData?: any;
    printerName?: string;
  }) {
    const payload: any = {};
    payload.type = 'jsreport';
    payload.jsreportTemplateName = jsreportTemplateName;
    payload.printerName = printerName;
    if (jsreportTemplateData && size(jsreportTemplateData)) {
      payload.jsreportTemplateData = jsreportTemplateData;
    }

    const reqTmsPrinter = request.post({
      url: ConfigService.get('printerHelper.url'),
      method: 'POST',
      json: payload,
    });
    reqTmsPrinter.pipe(res);
  }
}
