import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Bag } from './bag';
import { BagItem } from './bag-item';
import { DropoffHubDetail } from './dropoff_hub_detail';

@Entity('dropoff_hub', { schema: 'public' })
export class DropoffHub extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_hub_id',
  })
  dropoffHubId: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

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

  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'bag_number',
  })
  bagNumber: string;

  @ManyToOne(() => Bag, bag => bag.dropoffHubs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_id', referencedColumnName: 'bagId' })
  bag: Bag;

  @ManyToOne(() => BagItem, e => e.dropoffHub, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_item_id', referencedColumnName: 'bagItemId' })
  bagItem: BagItem;

  @OneToMany(() => DropoffHubDetail, e => e.dropoffHub, { cascade: ['insert'] })
  dropoffHubDetails: DropoffHubDetail[];
}
