import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('setting_status_role', { schema: 'public' })
export class RolePodManualStatus extends BaseEntity {
  @Column('uuid', {
    nullable: false,
    primary: true,
    name: 'setting_status_role_id',
  })
  settingStatusRoleId: string;

  @Column('integer', {
    nullable: false,
    name: 'role_id',
  })
  roleId: number;

  @Column('integer', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: number;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_bulky',
  })
  isBulky: boolean | null;

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
