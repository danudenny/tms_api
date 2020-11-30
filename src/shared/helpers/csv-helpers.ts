import moment = require('moment');
import express = require('express');
import fs = require('fs');
import { RequestErrorService } from '../services/request-error.service';
import { HttpStatus } from '@nestjs/common';
import { RedisService } from '../services/redis.service';

export abstract class CsvHelper {
  static async generateCSV(
    res: express.Response,
    data: any,
    fileName: string,
  ): Promise<any> {
    const fastcsv = require('fast-csv');

    // NOTE: create excel using unique name
    try {
      const ws = fs.createWriteStream(fileName);
      fastcsv.write(data, {headers: true}).pipe(ws);

      const filestream = fs.createReadStream(fileName);
      const mimeType = 'application/vnd.ms-excel';

      res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-type', mimeType);
      filestream.pipe(res);
    } catch (error) {
      RequestErrorService.throwObj(
        {
          message: `error ketika download excel Monitoring`,
        },
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      // Delete temporary saved-file in server
      if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
      }
    }
  }

  static async storePayload(payloadBody: any, prefix: string): Promise<string> {
    if (!payloadBody) {
      RequestErrorService.throwObj({
        message: 'body cannot be null or undefined',
      });
    }
    const identifier = moment().format('YYMMDDHHmmss');
    // const authMeta = AuthService.getAuthData();
    RedisService.setex(
      `export-${prefix}-${identifier}`,
      payloadBody,
      10 * 60,
      true,
    );
    return identifier;
  }
}
