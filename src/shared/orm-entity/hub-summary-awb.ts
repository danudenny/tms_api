import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { BagItem } from './bag-item';
import { Bag } from './bag';

@Entity('hub_summary_awb', { schema: 'public' })
export class HubSummaryAwb extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'hub_summary_awb_id',
  })
  hubSummaryAwbId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date_do_hub',
  })
  scanDateDoHub: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date_in_hub',
  })
  scanDateInHub: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date_out_hub',
  })
  scanDateOutHub: Date;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'do_hub',
  })
  doHub: boolean;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'in_hub',
  })
  inHub: boolean;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'out_hub',
  })
  outHub: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'awb_status_id_last',
  })
  awbStatusIdLast: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_id_do',
  })
  bagItemIdDo: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id_in',
  })
  bagItemIdIn: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_id_do',
  })
  bagIdDo: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_id_in',
  })
  bagIdIn: number | null;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id_do' })
  bagItemDo: BagItem;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id_in' })
  bagItemIn: BagItem;

  @OneToOne(() => Bag)
  @JoinColumn({ name: 'bag_id_do' })
  bagDo: Bag;

  @OneToOne(() => Bag)
  @JoinColumn({ name: 'bag_id_in' })
  bagIn: Bag;
}
