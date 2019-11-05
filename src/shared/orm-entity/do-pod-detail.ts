import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AwbItem } from './awb-item';
import { AwbItemAttr } from './awb-item-attr';
import { BagItem } from './bag-item';
import { DoPod } from './do-pod';
import { PodScanIn } from './pod-scan-in';
import { TmsBaseEntity } from './tms-base';

@Entity('do_pod_detail', { schema: 'public' })
export class DoPodDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_detail_id',
  })
  doPodDetailId: string;

  // @Column('bigint', {
  //   nullable: true,
  //   name: 'pod_scan_in_id',
  // })
  // podScanInId: number | null;

  @Column('character varying', {
    nullable: false,
    name: 'do_pod_id',
  })
  doPodId: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_id',
  })
  bagId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'transaction_status_id_last',
  })
  transactionStatusIdLast: number;

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

  @Column('bigint', {
    nullable: true,
    name: 'employee_journey_id_in',
  })
  employeeJourneyIdIn: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'employee_journey_id_out',
  })
  employeeJourneyIdOut: number | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_posted',
  })
  isPosted: boolean | null;

  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'bag_number',
  })
  bagNumber: string;

  // @OneToOne(() => PodScanIn)
  // @JoinColumn({ name: 'pod_scan_in_id' })
  // podScanIn: PodScanIn;

  @ManyToOne(() => DoPod)
  @JoinColumn({ name: 'do_pod_id' })
  doPod: DoPod;

  @OneToOne(() => AwbItem)
  @JoinColumn({ name: 'awb_item_id' })
  awbItem: AwbItem;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id' })
  bagItem: BagItem;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;
}
