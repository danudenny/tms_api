import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pod_scan', { schema: 'public' })
export class PodScan extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_scan_id',

  })
  podScanId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_pod_id',
  })
  doPodId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_id',
  })
  awbId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pod_scanin_date_time',
  })
  podScaninDateTime: Date | null;
}
