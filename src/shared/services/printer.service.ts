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
      formData: {
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
    const formData: any = {};
    formData.type = 'jsreport';
    formData.jsreportTemplateName = jsreportTemplateName;
    if (jsreportTemplateData && size(jsreportTemplateData)) {
      formData.jsreportTemplateData = jsreportTemplateData;
    }

    const reqTmsPrinter = request.post({
      url: ConfigService.get('printerHelper.url'),
      method: 'POST',
      formData,
    });
    reqTmsPrinter.pipe(res);
  }
}
