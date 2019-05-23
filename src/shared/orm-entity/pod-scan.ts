import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pod_scan', { schema: 'public' })
export class podScan extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name:'pod_scan_id',

  })
  podScanId: number;

  @Column('bigint', {
    nullable: false,
    name:'do_pod_id',
  })
  doPodid: string;

  @Column('bigint', {
    nullable: false,
    name:'awb_id',
  })
  awbId: string;

  @Column('bigint', {
    nullable: false,
    name:'awb_item_id'
  })
  awbItemId: string;

  @Column('bigint', {
    nullable: false,
    name:'branch_id',
  })
  branchId: string;

  @Column('bigint', {
    nullable: false,
    name:'user_id',
  })
  userId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name:'pod_scanin_date_time',
  })
  podScaninDateTime: Date | null;
}
