import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_pod_detail', { schema: 'public' })
export class DoPodDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_pod_detail_id: string;

  @Column('bigint', {
    nullable: false,

  })
  do_pod_id: string;

  @Column('bigint', {
    nullable: true,

  })
  awb_item_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  bag_item_id: string | null;

  @Column('bigint', {
    nullable: false,

  })
  do_pod_status_id_last: string;

  @Column('bigint', {
    nullable: true,

  })
  do_pod_history_id_last: string | null;

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

  @Column('boolean', {
    nullable: true,

  })
  is_scan_out: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  scan_out_type: string | null;

  @Column('boolean', {
    nullable: true,

  })
  is_scan_in: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 50,

  })
  scan_in_type: string | null;
}
