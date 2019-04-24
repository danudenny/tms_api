import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_pod_detail', { schema: 'public' })
export class DoPodDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_detail_id',
  })
  doPodDetailId: string;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_id',
  })
  doPodId: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_status_id_last',
  })
  doPodStatusIdLast: string;

  @Column('bigint', {
    nullable: true,
    name: 'do_pod_history_id_last',
  })
  doPodHistoryIdLast: string | null;

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

  @Column('boolean', {
    nullable: true,
    name: 'is_scan_out',
  })
  isScanOut: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'scan_out_type',
  })
  scanOutType: string | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_scan_in',
  })
  isScanIn: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'scan_in_type',
  })
  scanInType: string | null;
}
