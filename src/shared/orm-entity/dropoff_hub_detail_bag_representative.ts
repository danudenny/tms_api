import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { AwbItemAttr } from './awb-item-attr';
import { Awb } from './awb';
import { Branch } from './branch';
import { DropoffHubBagRepresentative } from './dropoff_hub_bag_representative';

@Entity('dropoff_hub_bag_representative_detail', { schema: 'public' })
export class DropoffHubDetailBagRepresentative extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_hub_bag_representative_detail_id',
  })
  dropoffHubDetailBagRepresentativeId: string;

  @Column('character varying', {
    name: 'dropoff_hub_bag_representative_id',
  })
  dropoffHubBagRepresentativeId: string;

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

  @ManyToOne(() => DropoffHubBagRepresentative, e => e.dropoffHubBagRepresentativeDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dropoff_hub_bag_representative_id', referencedColumnName: 'dropoffHubBagRepresentativeId' })
  dropoffHubBagRepresentative: DropoffHubBagRepresentative;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_id' })
  awb: Awb;
}
