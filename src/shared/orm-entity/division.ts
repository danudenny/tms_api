import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('division', { schema: 'public' })
export class Division extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  division_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  division_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  division_name: string;

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

  @Column('bigint', {
    nullable: true,

  })
  branch_id: string | null;
}
