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
import { AwbItem } from './awb-item';
import { Employee } from './employee';
import { AwbItemAttr } from './awb-item-attr';
import { BagItem } from './bag-item';
import { TmsBaseEntity } from './tms-base';

@Entity('pod_scan_in', { schema: 'public' })
export class PodScanIn extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_scan_in_id',
  })
  podScanInId: number;

  // @Column('bigint', {
  //   nullable: false,
  //   name: 'awb_id',
  // })
  // awbId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  // @Column('bigint', {
  //   nullable: true,
  //   name: 'bag_id',
  // })
  // bagId: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'scan_in_type',
  })
  scanInType: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'pod_scanin_date_time',
  })
  podScaninDateTime: Date;

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

  // TODO: mapping for join on scaninlist
  // @ManyToOne(() => Awb)
  // @JoinColumn({ name: 'awb_id' })
  // awb: Awb;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awb_item_attr: AwbItemAttr;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // @ManyToOne(() => Bag)
  // @JoinColumn({ name: 'bag_id' })
  // bag: Bag;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Employee, employee => employee, { eager: true , nullable: true})
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  // @OneToOne(() => DoPodDetail)
  // @JoinColumn({ name: 'pod_scan_in_id', referencedColumnName: 'podScanInId' })
  // do_pod_detail: DoPodDetail;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id' })
  bag_item: BagItem;
}
