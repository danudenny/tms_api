import { ReflectMetadata } from '@nestjs/common';
import { DECORATOR } from '../constants/decorator.constant';

export const AccessPermissionAuthGuardOptions = (...accessPermissionNames: string[]) =>
  ReflectMetadata(DECORATOR.ACCESS_PERMISSION_AUTH_GUARD_OPTIONS, accessPermissionNames);
