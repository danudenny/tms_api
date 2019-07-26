import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, ObservableInput, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SentryService } from '../services/sentry.service';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next
      .handle()
      .pipe(catchError(error => this.handleError(context, error)));
  }

  private handleError(context: ExecutionContext, error): ObservableInput<any> {
    console.error(error); // TODO: Replace with pino logger service
    SentryService.trackFromExceptionAndNestHostOrContext(error, context);

    if (!(error instanceof HttpException)) {
      return throwError(
        new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    } else {
      return throwError(error);
    }
  }
}
