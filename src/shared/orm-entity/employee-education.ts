import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('employee_education', { schema: 'public' })
export class EmployeeEducation extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  employee_education_id: string;

  @Column('bigint', {
    nullable: false,

  })
  employee_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  education: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  education_name: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  majors: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  education_start: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  education_end: string | null;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;
}
