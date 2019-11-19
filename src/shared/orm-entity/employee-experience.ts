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

@Entity('employee_experience', { schema: 'public' })
export class EmployeeExperience extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  employee_experience_id: string;

  @Column('bigint', {
    nullable: false,

  })
  employee_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  company: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  company_description: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  position: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  experience_start: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  experience_end: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 10,
    scale: 2,

  })
  last_salary: string | null;

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
