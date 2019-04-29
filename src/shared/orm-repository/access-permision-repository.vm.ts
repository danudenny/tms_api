import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { AccessPermission } from '../orm-entity/access-permision-entity.vm';
import { BaseRepository } from './base.repository';
import { castArray } from 'lodash';

@Injectable()
@EntityRepository(AccessPermission)
export class AccessPermissionRepository extends BaseRepository<
  AccessPermission
> {
  findByRoleNames(roleNames: string | string[]) {
    roleNames = castArray(roleNames);
    return this.createQueryBuilder()
      .innerJoinAndSelect(
        'roles',
        'role',
        'role.name IN :roleNames',
        { roleNames },
      )
      .getMany();
  }
}
