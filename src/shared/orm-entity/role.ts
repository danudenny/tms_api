import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RolePermission } from './role-permission';
import { TmsBaseEntity } from './tms-base';

@Entity('role', { schema: 'public' })
export class Role extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'role_id',
  })
  roleId: number;

  @Column('bigint', {
    nullable: true,
    name: 'role_id_parent',
  })
  roleIdParent: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('integer', {
    nullable: true,
  })
  lft: number | null;

  @Column('integer', {
    nullable: true,
  })
  rgt: number | null;

  @Column('integer', {
    nullable: true,
  })
  depth: number | null;

  @Column('integer', {
    nullable: true,
  })
  priority: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'role_name',
  })
  roleName: string;

  @OneToMany(() => RolePermission, e => e.role, {
    cascade: ['insert', 'update'],
  })
  rolePermissions: RolePermission[];

  // @OneToMany(type => UserRole, user_role => user_role.roleId)
  // userRoles: UserRole[];

  // @OneToOne(type => Branch)
  // @JoinColumn()
  // branch: Branch;
}
