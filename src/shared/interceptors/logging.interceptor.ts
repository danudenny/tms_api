import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { PinoLoggerService } from '../services/pino-logger.service';
import { WinstonLogglyService } from '../services/winston-loggly.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const method = req.method;
    const url = req.url;
    const body = req.body;
    const params = req.params;
    const query = req.query;

    const dataLog = {
      url,
      method,
      body,
      params,
      query,
    };
    PinoLoggerService.withContext('LoggingInterceptor').debug(dataLog);
    // Loggly
    WinstonLogglyService.info(dataLog);

    return next.handle();
  }
}
