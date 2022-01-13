import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import express = require('express');
import fclone from 'fclone';

import { ErrorParserService } from '../services/error-parser.service';
import { PinoLoggerService } from '../services/pino-logger.service';

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
        requestErrorResponse = ErrorParserService.parseRequestErrorFromExceptionAndArgumentsHost(
          exception,
          host,
        );
        PinoLoggerService.error('#### All Exception Filter : ', exception);
      } else {
        PinoLoggerService.warn('#### All Exception Filter, Error Response : ', requestErrorResponse);
      }
      const finalRequestErrorResponse = fclone(requestErrorResponse);
      response.status(status).json(finalRequestErrorResponse);
    }
  }
}
