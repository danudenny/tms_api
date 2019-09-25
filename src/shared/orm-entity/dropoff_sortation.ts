import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('dropoff_sortation', { schema: 'public' })
export class DropoffSortation extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_sortation_id',
  })
  dropoffSortationId: number;

  // @Column({
  //   name: 'dropoff_hub_id',
  // })
  // dropoffHubId: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'representative_id',
  })
  representativeId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'bag_id',
  })
  bagId: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;
}
