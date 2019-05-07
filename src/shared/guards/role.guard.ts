import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { identity, Observable } from 'rxjs';

import { AUTH } from '../constants/auth.constant';
import { DECORATOR } from '../constants/decorator.constant';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return (async () => {
      if (!AuthService.isLoggedIn) {
        return false;
      }

      const requestedRoleNames = this.reflector.get<string[]>(
        DECORATOR.ROLE_AUTH_GUARD_OPTIONS,
        context.getHandler(),
      ) || this.reflector.get<string[]>(
        DECORATOR.ROLE_AUTH_GUARD_OPTIONS,
        context.getClass(),
      ) || [];

      const requestedAccessPermissionNames = this.reflector.get<string[]>(
        DECORATOR.ACCESS_PERMISSION_AUTH_GUARD_OPTIONS,
        context.getHandler(),
      ) || this.reflector.get<string[]>(
        DECORATOR.ACCESS_PERMISSION_AUTH_GUARD_OPTIONS,
        context.getClass(),
      ) || [];

      const isSuper = this.validateSuperRole();
      if (isSuper) {
        return true;
      }

      let isValid = true;
      if (
        (requestedRoleNames && requestedRoleNames.length) ||
        (requestedAccessPermissionNames &&
          requestedAccessPermissionNames.length)
      ) {
        isValid = false;

        if (requestedRoleNames.length) {
          isValid = this.validateRoleNames(requestedRoleNames);
        }

        if (!isValid && requestedAccessPermissionNames.length) {
          isValid = await this.validateAccessPermissionNames(
            requestedAccessPermissionNames,
          );
        }
      }

      return isValid;
    })();
  }

  validateSuperRole() {
    const authMetadataRoles = AuthService.getAuthMetadataRoles();
    // if (authMetadataRoles.includes(AUTH.SUPER_ROLE_NAME)) {
    //   return true;
    // }

    return false;
  }

  validateRoleNames(requestedRoleNames: string[]) {
    if (
      !requestedRoleNames ||
      (requestedRoleNames && !requestedRoleNames.length)
    ) {
      return true;
    }

    const authMetadataRoles = AuthService.getAuthMetadataRoles();
    return (
      authMetadataRoles
        .map(requestedRole => authMetadataRoles.includes(requestedRole))
        .filter(identity).length > 0
    );
  }

  async validateAccessPermissionNames(
    requestedAccessPermissionNames: string[],
  ) {
    const authMetadataRoles = AuthService.getAuthMetadataRoles();
    const authMetadataAccessPermissions = []; // retrive from database
    const authMetadataAccessPermissionNames = authMetadataAccessPermissions.map(
      authMetadataAccessPermission => authMetadataAccessPermission.name,
    );
    return (
      requestedAccessPermissionNames
        .map(requestedAccessPermission =>
          authMetadataAccessPermissionNames.includes(requestedAccessPermission),
        )
        .filter(identity).length > 0
    );
  }
}
