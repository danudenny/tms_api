import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext, next: CallHandler): Observable<any> {
    const logger = require('pino')()
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const body = req.body
    if (req) {
      return next
      .handle()
      .pipe(
        tap(() =>
          // logger.info(JSON.stringify(body)),
          logger.info(body),
        ),
      );
    }
  }
}
