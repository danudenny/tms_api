import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { error } from 'util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const logger = require('pino')() 
    logger.info(exception.message)
    const messageStatus = HttpStatus[status];

    response
    .status(status)
    .send({
      statusCode: status,
      error: messageStatus,
      message:exception.message,
      timestamp: new Date(Date.now()).toLocaleString(),
    });
    }
  }

