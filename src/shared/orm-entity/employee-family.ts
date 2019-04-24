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

@Entity('employee_family', { schema: 'public' })
export class EmployeeFamily extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  employee_family_id: string;

  @Column('bigint', {
    nullable: false,

  })
  employee_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  full_name: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  status: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  gender: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  last_education: string | null;

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
