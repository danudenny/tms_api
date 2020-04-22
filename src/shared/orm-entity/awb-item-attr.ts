import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { AwbItem } from './awb-item';
import { BagItem } from './bag-item';
import { Branch } from './branch';
import { AwbStatus } from './awb-status';
import { DoReturnAwb } from './do_return_awb';

@Entity('awb_item_attr', { schema: 'public' })
export class AwbItemAttr extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'awb_item_attr_id',
  })
  awbItemAttrId: string;

  // @Column('bigint', {
  //   nullable: true,
  //   name: 'awb_attr_id',
  // })
  // awbAttrId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  // @Column('character varying', {
  //   nullable: false,
  //   length: 255,
  //   name: 'awb_number_pl',
  // })
  // awbNumberPl: string;

  @Column('bigint', {
    nullable: true,
    name: 'awb_history_id_last',
  })
  awbHistoryIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id_last_public',
  })
  awbStatusIdLastPublic: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_last',
  })
  userIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_last',
  })
  branchIdLast: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_history_date_last',
    })
  awbHistoryDateLast: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'lead_time_run_days',
  })
  leadTimeRunDays: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_status_final_date',
    })
  awbStatusFinalDate: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'try_attempt',
  })
  tryAttempt: number;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_final',
  })
  awbStatusIdFinal: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'lead_time_final_days',
  })
  leadTimeFinalDays: number;

  @Column('character varying', {
    nullable: true,
  })
  uuid: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'awb_third_party',
  })
  awbThirdParty: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'doreturn_new_awb',
  })
  doreturnNewAwb: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'doreturn_new_awb_3pl',
  })
  doreturnNewAwb3Pl: string | null;

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

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_next',
  })
  branchIdNext: number | null;

  // relation model
  @OneToOne(() => Branch, branch => branch, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'branch_id_last' })
  branchLast: Branch;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_package_combined',
  })
  isPackageCombined: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id_last',
  })
  bagItemIdLast: number;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id_last'})
  bagItemLast: BagItem;

  @OneToOne(() => DoReturnAwb)
  @JoinColumn({ name: 'awb_status_id_last', referencedColumnName: 'awbStatusIdLast'})
  doReturnAwb: DoReturnAwb;

  @OneToOne(() => AwbItem)
  @JoinColumn({ name: 'awb_item_id'})
  awbItem: AwbItem;

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id_last'})
  awbStatus: AwbStatus;

  // new field
  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_sync',
  })
  isSync: boolean;
}
