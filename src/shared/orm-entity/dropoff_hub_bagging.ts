import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Bag } from './bag';
import { BagItem } from './bag-item';
import { Branch } from './branch';
import { DropoffHubDetailBagging } from './dropoff_hub_detail_bagging';
import { Bagging } from './bagging';

@Entity('dropoff_hub_bagging', { schema: 'public' })
export class DropoffHubBagging extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_hub_bagging_id',
  })
  dropoffHubBaggingId: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'bagging_id',
  })
  baggingId: number;

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

  @Column('bigint', {
    nullable: true,
    name: 'is_smd',
  })
  isSmd: number;

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

  @ManyToOne(() => Bagging, bagging => bagging.dropoffHubBagging, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bagging_id', referencedColumnName: 'baggingId' })
  bagging: Bagging;

  @OneToMany(() => DropoffHubDetailBagging, e => e.dropoffHubBagging, { cascade: ['insert'] })
  dropoffHubBaggingDetails: DropoffHubDetailBagging[];

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;
}
