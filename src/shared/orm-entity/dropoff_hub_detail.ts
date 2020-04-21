import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { DropoffHub } from './dropoff_hub';
import { AwbItemAttr } from './awb-item-attr';
import { Awb } from './awb';
import { Branch } from './branch';

@Entity('dropoff_hub_detail', { schema: 'public' })
export class DropoffHubDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_hub_detail_id',
  })
  dropoffHubDetailId: string;

  @Column('character varying', {
    name: 'dropoff_hub_id',
  })
  dropoffHubId: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;
  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;

  @ManyToOne(() => DropoffHub, e => e.dropoffHubDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dropoff_hub_id', referencedColumnName: 'dropoffHubId' })
  dropoffHub: DropoffHub;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_id' })
  awb: Awb;
}
