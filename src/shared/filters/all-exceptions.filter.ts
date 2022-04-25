import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import express = require('express');
import fclone from 'fclone';
import { ConfigService } from '../services/config.service';
import { ErrorParserService } from '../services/error-parser.service';
import { PinoLoggerService } from '../services/pino-logger.service';
import { SlackUtil } from '../util/slack';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<express.Response>();
    const request = ctx.getRequest();
    let requestErrorResponse = exception;
    if (request && response) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (exception instanceof HttpException) {
        const exceptionStatus = exception.getStatus();
        if (exceptionStatus) {
          status = exceptionStatus;
          requestErrorResponse = exception.getResponse();
        }
      }
      // NOTE: detail error stack only fatal status
      const fatalStatus = [500, 501, 502, 503, 504, 505];
      if (fatalStatus.includes(status)) {
        requestErrorResponse = ErrorParserService.parseRequestErrorFromExceptionAndArgumentsHost(exception, host);
        PinoLoggerService.error('#### All Exception Filter : ', exception);
        const fullUrl =  request.headers.host + request.url;
        SlackUtil.sendMessage(
          ConfigService.get('slackchannel.errorCode'),
          `#### All Exception Filter : ${exception}`,
          fullUrl,
          request.body,
        );
      } else {
        PinoLoggerService.warn('#### All Exception Filter, Error Response : ', requestErrorResponse);
      }
      const finalRequestErrorResponse = fclone(requestErrorResponse);
      response.status(status).json(finalRequestErrorResponse);
    }
  }
}
