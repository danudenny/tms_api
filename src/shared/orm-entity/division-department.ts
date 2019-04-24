import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('division_department', { schema: 'public' })
export class DivisionDepartment extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  division_department_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('bigint', {
    nullable: false,

  })
  division_id: string;

  @Column('bigint', {
    nullable: false,

  })
  department_id: string;

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
