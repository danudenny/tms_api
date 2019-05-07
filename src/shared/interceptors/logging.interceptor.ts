import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext, next: CallHandler): Observable<any> {
    // const now = Date.now();
    
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    console.log(method,url);
    
    if (req) {
      return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log(JSON.stringify(req.body)),
        ),
      );
    
    }
  }
}
