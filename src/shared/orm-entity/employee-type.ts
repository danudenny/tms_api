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

@Entity('employee_type', { schema: 'public' })
export class EmployeeType extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  employee_type_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  employee_type_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  employee_type_name: string;

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
