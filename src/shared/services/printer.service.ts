import express = require('express');
import { size } from 'lodash';
import request = require('request');

import { ConfigService } from './config.service';

export class PrinterService {
  public static responseForRawCommands(
    res: express.Response,
    rawCommands: string,
  ) {
    const reqTmsPrinter = request.post({
      url: ConfigService.get('printerHelper.url'),
      method: 'POST',
      json: {
        type: 'raw',
        rawCommands,
      },
    });
    reqTmsPrinter.pipe(res);
  }

  public static responseForJsReport(
    res: express.Response,
    jsreportTemplateName: string,
    jsreportTemplateData?: any,
  ) {
    const payload: any = {};
    payload.type = 'jsreport';
    payload.jsreportTemplateName = jsreportTemplateName;
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
