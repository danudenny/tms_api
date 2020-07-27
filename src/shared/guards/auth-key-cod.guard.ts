import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthKeyCodGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const partnerToken: string = RequestContextMetadataService.getMetadata(
      'AUTH_KEY_TOKEN',
    );

    if (partnerToken) {
        // NOTE: auth key cod
        if (partnerToken == '5a71a345b4eaa9d23b4d4c745e7785e9') {
          return true;
        } else {
          throw new BadRequestException('API KEY not found');
        }
    } else {
      throw new ForbiddenException('API KEY is required');
    }
  }
}
