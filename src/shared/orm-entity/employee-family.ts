import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee_family', { schema: 'public' })
export class EmployeeFamily extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_family_id',
  })
  employeeFamilyId: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'full_name',
  })
  fullName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status',
  })
  status: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'gender',
  })
  gender: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'last_education',
  })
  lastEducation: string | null;

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
