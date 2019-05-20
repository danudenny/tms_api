import { SetMetadata } from '@nestjs/common';
import { DECORATOR } from '../constants/decorator.constant';

export const AccessPermissionAuthGuardOptions = (...accessPermissionNames: string[]) =>
  SetMetadata(DECORATOR.ACCESS_PERMISSION_AUTH_GUARD_OPTIONS, accessPermissionNames);
