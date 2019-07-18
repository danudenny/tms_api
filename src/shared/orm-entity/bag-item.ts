import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Bag } from './bag';
import { BagItemAwb } from './bag-item-awb';
import { BagItemStatus } from './bag-item-status';

@Entity('bag_item', { schema: 'public' })
@Index('bag_item_bag_id_idx', ['bagId'])
@Index('bag_item_bag_seq_idx', ['bagSeq'])
@Index('bag_item_is_deleted_idx', ['isDeleted'])
export class BagItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_item_id',
  })
  bagItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'bag_id',
  })
  bagId: number;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  weight: number | null;

  @Column('integer', {
    nullable: false,
    name: 'bag_seq',
  })
  bagSeq: number;

  @Column('integer', {
    nullable: false,
    name: 'bag_item_status_id_last',
  })
  bagItemStatusIdLast: number;

  @Column('integer', {
    nullable: false,
    name: 'branch_id_last',
  })
  branchIdLast: number;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_history_id',
  })
  bagItemHistoryId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bagging_id_last',
  })
  baggingIdLast: number | null;

  // relation model
  @ManyToOne(() => Bag, bag => bag.bagItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bag_id', referencedColumnName: 'bagId' })
  bag: Bag;

  @OneToMany(() => BagItemAwb, bagItemAwb => bagItemAwb.bagItem)
  bagItemAwbs: BagItemAwb[];
}
