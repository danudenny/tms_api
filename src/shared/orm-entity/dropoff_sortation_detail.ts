import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { DropoffSortation } from './dropoff_sortation';
import { AwbItemAttr } from './awb-item-attr';
import { Awb } from './awb';

@Entity('dropoff_sortation_detail', { schema: 'public' })
export class DropoffSortationDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_sortation_detail_id',
  })
  dropoffSortationDetailId: string;

  @Column('character varying', {
    name: 'dropoff_sortation_id',
  })
  dropoffSortationId: string;

  // @Column('character varying', {
  //   name: 'dropoff_hub_id',
  // })
  // dropoffHubId: string;

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

  @ManyToOne(() => DropoffSortation, e => e.dropoffSortationDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dropoff_sortation_id', referencedColumnName: 'dropoffSortationId' })
  dropoffSortation: DropoffSortation;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_id' })
  awb: Awb;
}
