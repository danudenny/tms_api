import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const logger = require('pino')() 
    logger.info(request.body)
    const messageStatus = HttpStatus[status];

    response
    .status(status)
    .send({
      statusCode: status,
      errorMessage: messageStatus,
      ip: request.ip,
      // timestamp: new Date().toISOString(),
      body: request.body,
    });
    }
  }