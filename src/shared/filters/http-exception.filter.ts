import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { ErrorParserService } from '../services/error-parser.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // sometimes response is not an response instance anymore, it is already the returned data (happening on some exception throw)
    if (response.code) {
      const request = ctx.getRequest();
      const status = exception.getStatus();
      const messageStatus = HttpStatus[status];

      const requestError = ErrorParserService.parseRequestErrorFromExceptionAndArgumentsHost(exception, host);

      const logger = require('pino')();
      const data = {
        statusCode: status,
        error: messageStatus,
        ip: request.ip,
        message: exception.message,
        timestamp: new Date(Date.now()).toLocaleString(),
      };
      logger.info(data);
      response.code(status).send(data);
    }
  }
}
