import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bag_item', { schema: 'public' })
@Index('bag_item_bag_id_idx', ['bag_id'])
@Index('bag_item_bag_seq_idx', ['bag_seq'])
@Index('bag_item_is_deleted_idx', ['is_deleted'])
export class BagItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bag_item_id: string;

  @Column('bigint', {
    nullable: false,

  })
  bag_id: string;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,

  })
  weight: string | null;

  @Column('integer', {
    nullable: false,

  })
  bag_seq: number;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;

  @Column('bigint', {
    nullable: true,

  })
  bag_item_history_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  bagging_id_last: string | null;
}
