import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { DECORATOR } from '../constants/decorator.constant';
import { AuthService } from '../services/auth.service';

@Injectable()
export class PermissionRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return (async () => {
      if (!AuthService.hasPermission) {
        return false;
      }
      const requestedRoles =
        this.reflector.get<string[]>(
          DECORATOR.ROLE_AUTH_GUARD_OPTIONS,
          context.getHandler(),
        ) ||
        this.reflector.get<string[]>(
          DECORATOR.ROLE_AUTH_GUARD_OPTIONS,
          context.getClass(),
        ) ||
        [];

      return this.validateRoles(requestedRoles);
    })();
  }

  validateRoles(allowedRoles: string[]): boolean {
    if (!allowedRoles || (allowedRoles && !allowedRoles.length)) {
      return true;
    }

    const perm = AuthService.getPermissionTokenPayload();
    return allowedRoles.includes(perm.roleId.toString());
  }
}
