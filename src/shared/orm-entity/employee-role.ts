import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee_role', { schema: 'public' })
export class EmployeeRole extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_role_id',
  })
  employeeRoleId: string;

  @Column('bigint', {
    nullable: true,
    name: 'employee_role_id_parent',
  })
  employeeRoleIdParent: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'lft',
  })
  lft: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'rgt',
  })
  rgt: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',
    name: 'depth',
  })
  depth: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',
    name: 'priority',
  })
  priority: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'employee_role_code',
  })
  employeeRoleCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'employee_role_name',
  })
  employeeRoleName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'employee_level',
  })
  employeeLevel: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'employee_position',
  })
  employeePosition: string;

  @Column('text', {
    nullable: true,
    name: 'description',
  })
  description: string | null;

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
