import { CanActivate, HttpStatus, Injectable } from '@nestjs/common';

import { AuthService } from '../services/auth.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';
import { RequestErrorService } from '../services/request-error.service';

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

      return true;
    } else {
      RequestErrorService.throwObj(
        {
          message: 'Permission token is required',
        },
        HttpStatus.FORBIDDEN,
      );

      return false;
    }
  }
}
