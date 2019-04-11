import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTH } from '../constants/auth.constant';
import { DECORATOR } from '../constants/decorator.constant';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!AuthService.isLoggedIn) {
      return false;
    }

    const requestedRoleNames =
      this.reflector.get<string[]>(
        DECORATOR.ROLE_AUTH_GUARD_OPTIONS,
        context.getHandler(),
      ) ||
      this.reflector.get<string[]>(
        DECORATOR.ROLE_AUTH_GUARD_OPTIONS,
        context.getClass(),
      ) ||
      [];

    const requestedAccessPermissionNames =
      this.reflector.get<string[]>(
        DECORATOR.ACCESS_PERMISSION_AUTH_GUARD_OPTIONS,
        context.getHandler(),
      ) ||
      this.reflector.get<string[]>(
        DECORATOR.ACCESS_PERMISSION_AUTH_GUARD_OPTIONS,
        context.getClass(),
      ) ||
      [];

    const isSuper = this.validateSuperRole();
    if (isSuper) {
      return true;
    }

    // TODO: implement validation for non Superadmin roles, you can use requestedRoleNames or requestedAccessPermissionNames

    return true;
  }

  validateSuperRole() {
    const authMetadataRoles = AuthService.getAuthMetadataRoles();
    if (authMetadataRoles.includes(AUTH.SUPER_ROLE_NAME)) {
      return true;
    }

    return false;
  }
}
