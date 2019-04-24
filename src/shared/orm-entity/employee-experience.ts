import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employee_experience', { schema: 'public' })
export class EmployeeExperience extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_experience_id',
  })
  employeeExperienceId: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'company',
  })
  company: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'company_description',
  })
  companyDescription: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'position',
  })
  position: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'experience_start',
  })
  experienceStart: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'experience_end',
  })
  experienceEnd: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 2,
    name: 'last_salary',
  })
  lastSalary: string | null;

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
