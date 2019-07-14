import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role', { schema: 'public' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  role_id: number;

  @Column('bigint', {
    nullable: true,

  })
  role_id_parent: number | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id: number | null;

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

  })
  role_name: string;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: number;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: number;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;

  // @OneToMany(type => UserRole, user_role => user_role.roleId)
  // userRoles: UserRole[];

  // @OneToMany(type => RolePermission, role_permission => role_permission.roleId)
  // rolePermission: RolePermission[];

  // @OneToOne(type => Branch)
  // @JoinColumn()
  // branch: Branch;
}
