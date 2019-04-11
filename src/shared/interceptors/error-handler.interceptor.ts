import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, ObservableInput, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
  public intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(catchError(error => this.handleError(error)));
  }

  private handleError(error): ObservableInput<any> {
    if (!(error instanceof HttpException)) {
      return throwError(
        new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    } else {
      return throwError(error);
    }
  }
}
