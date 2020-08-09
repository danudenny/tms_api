import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '../../../shared/services/config.service';

@Injectable()
export class AuthApiKeyCpsGuard implements CanActivate {
  constructor() {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    return this.hasValidCredentials(request);
  }

  private hasValidCredentials(request: Request): boolean {
    if (request['headers']['api-key'] === ConfigService.get('cps.apiKey')) {
      return true;
    } else {
      return false;
    }
  }
}
