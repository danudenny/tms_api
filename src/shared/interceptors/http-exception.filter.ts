import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const status = exception.getStatus();
    const logger = require('pino')() 
    logger.info(request.body)
    
    response
      .status(status)
      .send({
        statusCode: status,
        body: request.body,
      });
  }


}