import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Partner } from '../orm-entity/partner';

@Injectable()
export class AuthXAPIKeyGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    return await this.hasValidCredentials(request);
  }

  private async hasValidCredentials(request: Request): Promise<boolean> {
    const partner = await Partner.findOne({
      select: ['partner_id'],
      where: { api_key: request['headers']['x-api-key'] },
    });
    if (partner) {
      // TODO: set result data to redis
      return true;
    } else {
      return false;
    }
  }
}
