import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

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
}
