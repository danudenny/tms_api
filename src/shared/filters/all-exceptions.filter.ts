import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { ErrorParserService } from '../services/error-parser.service';
import { PinoLoggerService } from '../services/pino-logger.service';
import { SentryService } from '../services/sentry.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    PinoLoggerService.error(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    SentryService.trackFromExceptionAndNestHostOrContext(exception, host);

    if (request && response) {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      if (exception instanceof HttpException) {
        const exceptionStatus = exception.getStatus();
        if (exceptionStatus) {
          status = exceptionStatus;
        }
      }

      const requestErrorResponse = ErrorParserService.parseRequestErrorFromExceptionAndArgumentsHost(exception, host);

      response.status(status).json(requestErrorResponse);
    }
  }
}
