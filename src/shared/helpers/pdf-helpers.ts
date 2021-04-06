import express = require('express');
import fs = require('fs');
import { RequestErrorService } from '../services/request-error.service';
import { HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {ConfigService} from '../services/config.service';

export abstract class PdfHelper {

  public static getConfigJsReport() {
    return ConfigService.get('printerHelper');
  }

  public static async responseForJsReportPDF(
    res: express.Response,
    templates: any,
    fileName: string,
  ) {
    const config = this.getConfigJsReport();
    const auth = 'Basic ' + new Buffer(config.username + ':' + config.password).toString('base64');
    const options = {
      headers: {
        'Content-type': 'application/json',
        'Authorization': auth,
      },
      responseType: 'stream',
    };

    const response = await axios.post(config.urlApiJsReport, templates, options);
    const ws = fs.createWriteStream(fileName);

    response.data.pipe(ws).on('finish', function() {
      try {
        const mimeType = 'application/pdf';
        res.setHeader('Content-type', mimeType);
        res.setHeader('Content-disposition', 'attachment; filename=' + 'korwil_monitoring.pdf');

        const filestream = fs.createReadStream(fileName);
        filestream.pipe(res);
      } catch (error) {
        RequestErrorService.throwObj(
          {
            message: `error ketika download PDF Korwil`,
          },
          HttpStatus.BAD_REQUEST,
        );
      } finally {
        if (fs.existsSync(fileName)) {
          fs.unlinkSync(fileName);
        }
      }
    });
  }
}
