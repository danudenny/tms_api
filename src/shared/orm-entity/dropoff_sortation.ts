import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Bag } from './bag';
import { BagItem } from './bag-item';
import { DropoffHubDetail } from './dropoff_hub_detail';
import { DropoffSortationDetail } from './dropoff_sortation_detail';

@Entity('dropoff_sortation', { schema: 'public' })
export class DropoffSortation extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_sortation_id',
  })
  dropoffSortationId: string;

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

  @ManyToOne(() => Bag, bag => bag.dropoffSortations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_id', referencedColumnName: 'bagId' })
  bag: Bag;

  @ManyToOne(() => BagItem, e => e.dropoffSortation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_item_id', referencedColumnName: 'bagItemId' })
  bagItem: BagItem;

  @OneToMany(() => DropoffSortationDetail, e => e.dropoffSortation, { cascade: ['insert'] })
  dropoffSortationDetails: DropoffSortationDetail[];
}
