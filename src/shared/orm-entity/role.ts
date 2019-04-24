import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role', { schema: 'public' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'role_id',
  })
  roleId: string;

  @Column('bigint', {
    nullable: true,
    name: 'role_id_parent',
  })
  roleIdParent: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('integer', {
    nullable: true,
    name: 'lft',
  })
  lft: number | null;

  @Column('integer', {
    nullable: true,
    name: 'rgt',
  })
  rgt: number | null;

  @Column('integer', {
    nullable: true,
    name: 'depth',
  })
  depth: number | null;

  @Column('integer', {
    nullable: true,
    name: 'priority',
  })
  priority: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'role_name',
  })
  roleName: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
