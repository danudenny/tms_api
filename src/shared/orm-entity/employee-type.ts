import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee_type', { schema: 'public' })
export class EmployeeType extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_type_id',
  })
  employeeTypeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'employee_type_code',
  })
  employeeTypeCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'employee_type_name',
  })
  employeeTypeName: string;

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
