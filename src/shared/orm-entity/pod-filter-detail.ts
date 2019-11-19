import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { User } from './user';
import { BagItem } from './bag-item';
import { PodFilter } from './pod-filter';

@Entity('pod_filter_detail', { schema: 'public' })
export class PodFilterDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_filter_detail_id',
  })
  podFilterDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'pod_filter_id',
  })
  podFilterId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date_time',
  })
  scanDateTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'start_date_time',
  })
  startDateTime: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'end_date_time',
  })
  endDateTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_id',
  })
  bagItemId: number;

  @Column('integer', {
    nullable: false,
    default: () => 0,
    name: 'total_awb_item',
  })
  totalAwbItem: number | null;

  @Column('integer', {
    nullable: false,
    default: () => 0,
    name: 'total_awb_filtered',
  })
  totalAwbFiltered: number | null;

  @Column('integer', {
    nullable: false,
    default: () => 0,
    name: 'total_awb_not_in_bag',
  })
  totalAwbNotInBag: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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

  @ManyToOne(() => PodFilter)
  @JoinColumn({ name: 'pod_filter_id' })
  podFilter: PodFilter;

  @ManyToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id' })
  bagItem: BagItem;
}
