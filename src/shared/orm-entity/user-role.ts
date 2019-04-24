import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_role', { schema: 'public' })
export class UserRole extends BaseEntity {
  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: string;

  @Column('bigint', {
    nullable: false,
    name: 'role_id',
  })
  roleId: string;

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

  @Column('bigint', {
    nullable: false,
    default: () => '1',
    name: 'branch_id',
  })
  branchId: string;

  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_role_id',
  })
  userRoleId: string;
}
