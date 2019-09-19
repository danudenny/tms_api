import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('dropoff_sortation_detail', { schema: 'public' })
export class DropoffSortationDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'dropoff_sortation_detail_id',
  })
  dropoffSortationDetailId: number;

  @Column({
    type: 'bigint',
    name: 'dropoff_sortation_id',
  })
  dropoffSortationId: number;

  @Column({
    type: 'bigint',
    name: 'dropoff_hub_id',
  })
  dropoffHubId: number;

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
}
