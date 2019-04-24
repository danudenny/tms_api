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

@Entity('employee_role', { schema: 'public' })
export class EmployeeRole extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  employee_role_id: string;

  @Column('bigint', {
    nullable: true,

  })
  employee_role_id_parent: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  lft: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  rgt: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',

  })
  depth: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',

  })
  priority: number;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  employee_role_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  employee_role_name: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  employee_level: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  employee_position: string;

  @Column('text', {
    nullable: true,

  })
  description: string | null;

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
