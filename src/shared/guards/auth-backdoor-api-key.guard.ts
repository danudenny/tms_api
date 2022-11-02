import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';

@Injectable()
export class AuthBackdoorApiKeyGuard implements CanActivate {
  constructor() {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    return this.hasValidCredentials(request);
  }

  private hasValidCredentials(request: Request): boolean {
    if (request['headers']['x-backdoor-api-key'] === ConfigService.get('vendorLogisticService.backdoorApiKey')) {
      return true;
    } else {
      return false;
    }
  }
}