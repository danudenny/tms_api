import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee_education', { schema: 'public' })
export class EmployeeEducation extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_education_id',
  })
  employeeEducationId: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'education',
  })
  education: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'education_name',
  })
  educationName: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'majors',
  })
  majors: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'education_start',
  })
  educationStart: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'education_end',
  })
  educationEnd: string | null;

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
