import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Branch } from './branch';
import { Awb } from './awb';
import { User } from './user';
import { DoPod } from './do-pod';
import { Bag } from './bag';

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
    name: 'bag_item_id',
  })
  bagItemId: number;

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

  // TODO: mapping for join on scaninlist
  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Awb)
  @JoinColumn({ name: 'awb_id' })
  awb: Awb;

  @ManyToOne(() => Bag)
  @JoinColumn({ name: 'bag_id' })
  bag: Bag;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DoPod)
  @JoinColumn({ name: 'do_pod_id' })
  do_pod: DoPod;
}
