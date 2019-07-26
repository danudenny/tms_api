import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const messageStatus = HttpStatus[status];

    const logger = require('pino')();
    const data = {
      statusCode: status,
      error: messageStatus,
      ip: request.ip,
      message: exception.message,
      timestamp: new Date(Date.now()).toLocaleString(),
    };
    logger.info(data);
    // FIXME: ???
    response.code(status).send(data);
  }
}
