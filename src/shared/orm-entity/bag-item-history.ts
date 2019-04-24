import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bag_item_history', { schema: 'public' })
export class BagItemHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bag_item_history_id: string;

  @Column('bigint', {
    nullable: false,

  })
  bag_item_id: string;

  @Column('bigint', {
    nullable: true,

  })
  user_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  branch_id: string | null;

  @Column('bigint', {
    nullable: false,

  })
  bag_item_status_id: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  history_date: Date;

  @Column('text', {
    nullable: true,

  })
  note: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_table: string | null;

  @Column('bigint', {
    nullable: true,

  })
  ref_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  ref_module: string | null;

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
