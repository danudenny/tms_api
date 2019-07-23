import { CanActivate, Injectable } from '@nestjs/common';

import { AuthService } from '../services/auth.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class PermissionTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(): Promise<boolean> {
    const permissionToken = RequestContextMetadataService.getMetadata(
      'PERMISSION_TOKEN',
    );
    if (permissionToken) {
      const permissionTokenPayload = await this.authService.handlePermissionJwtToken();
      AuthService.setPermissionTokenPayload(permissionTokenPayload);
    }

    // TODO: Throw error if permissionToken is undefined / empty / not being passed from request
    return true;
  }
}
