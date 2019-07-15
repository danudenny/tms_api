import { HttpStatus } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { RolePermission } from '../../../../shared/orm-entity/role-permission';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RolePermissionListPayloadVm } from '../../models/role-permission-list-payload.vm';
import { RolePermissionListResponseVm } from '../../models/role-permission-list-response.vm';
import { RolePermissionUpdatePayloadVm } from '../../models/role-permission-update-payload.vm';
import { RolePermissionUpdateResponseVm } from '../../models/role-permission-update-response.vm';

export class RolePermissionService {
  public static async rolePermissionListByRequest({
    roleId,
  }: RolePermissionListPayloadVm): Promise<RolePermissionListResponseVm> {
    const q = RepositoryService.rolePermission.findAll();

    const rolePermissions = await q
      .select({
        name: true,
      })
      .where(e => e.role_id, w => w.equals(roleId))
      .exec();

    const rolePermissionNames = rolePermissions.map(
      rolePermission => rolePermission.name,
    );

    const response = new RolePermissionListResponseVm();
    response.rolesAccessPermissions = rolePermissionNames;

    return response;
  }

  public static async rolePermissionUpdateByRequest({
    roleId,
    rolesAccessPermissions,
  }: RolePermissionUpdatePayloadVm): Promise<RolePermissionUpdateResponseVm> {
    const role = await RepositoryService.role.loadById(roleId);
    if (!role) {
      ContextualErrorService.throwObj(
        {
          message: `Role with id ${roleId} cannot be found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const rolePermissions: RolePermission[] = [];

    for (const rolePermissionName of rolesAccessPermissions) {
      const rolePermission = RepositoryService.rolePermission.manager.create(RolePermission, {
        role_id: roleId,
        nav: rolePermissionName,
        name: rolePermissionName,
      });
      rolePermissions.push(rolePermission);
    }

    await getConnection().transaction(async entityManager => {
      await entityManager
        .createQueryBuilder()
        .delete()
        .from(RolePermission)
        .where('role_id = :roleId', { roleId })
        .execute();

      await entityManager
        .createQueryBuilder()
        .insert()
        .into(RolePermission)
        .values(rolePermissions)
        .execute();
    });

    const response = new RolePermissionUpdateResponseVm();
    response.status = 'ok';
    response.message = 'success';

    return response;
  }
}
