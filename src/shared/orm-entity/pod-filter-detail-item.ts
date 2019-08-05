import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { User } from './user';
import { BagItem } from './bag-item';
import { PodFilterDetail } from './pod-filter-detail';
import { AwbItem } from './awb-item';

@Entity('pod_filter_detail_item', { schema: 'public' })
export class PodFilterDetailItem extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_filter_detail_item_id',
  })
  podFilterDetailItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'pod_filter_detail_id',
  })
  podFilterDetailId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date_time',
  })
  scanDateTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_troubled',
  })
  isTroubled: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'awb_trouble_id',
  })
  awbTroubleId: number;

  @Column('int', {
    nullable: false,
    name: 'to_type',
  })
  toType: number;

  @Column('bigint', {
    nullable: false,
    name: 'to_id',
  })
  toId: number;

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

  // added by mohammad satria, 31 jul 2019
  @Column('bigint', {
    nullable: true,
    name: 'to_id',
  })
  toId: number;

  // added by mohammad satria, 5 aug 2019
  @Column('integer', {
    nullable: true,
    name: 'to_type',
  })
  toType: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number;

  @Column('boolean', {
    nullable: true,
    name: 'is_package_combine',
  })
  isPackageCombine: boolean;

  @ManyToOne(() => PodFilterDetail)
  @JoinColumn({ name: 'pod_filter_detail_id' })
  podFilterDetail: PodFilterDetail;

  @ManyToOne(() => AwbItem)
  @JoinColumn({ name: 'awb_item_id' })
  awbItem: AwbItem;

}
