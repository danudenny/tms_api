import { ReflectMetadata } from '@nestjs/common';
import { DECORATOR } from '../constants/decorator.constant';

export const RoleAuthGuardOptions = (...roleNames: string[]) =>
  ReflectMetadata(DECORATOR.ROLE_AUTH_GUARD_OPTIONS, roleNames);
