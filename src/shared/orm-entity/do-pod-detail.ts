import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { PodScanIn } from './pod-scan-in';

@Entity('do_pod_detail', { schema: 'public' })
export class DoPodDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pod_detail_id',
  })
  doPodDetaiId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_id',
  })
  doPodId: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_status_id_last',
  })
  doPodStatusIdLast: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_pod_history_id_last',
  })
  do_pod_history_id_last: number | null;

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

  // @Column('character varying', {
  //   nullable: true,
  //   length: 50,
  //   name: 'scan_in_type',
  // })
  // scanInType: string | null;

  // @Column('bigint', {
  //   nullable: false,
  //   name: 'employee_journey_id_in',
  // })
  // employeeJourneyIdIn: number | null;

  // @Column('bigint', {
  //   nullable: false,
  //   name: 'employee_journey_id_out',
  // })
  // employeeJourneyIdOut: number | null;

  @Column('boolean', {
    nullable: true,
    name: 'is_posted',
  })
  isPosted: boolean | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_final: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_final_rounded: string | null;

  @OneToOne(() => PodScanIn)
  @JoinColumn({ name: 'pod_scan_in_id' })
  pod_scan_in: PodScanIn;
}
