import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bagging_item', { schema: 'public' })
export class BaggingItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bagging_item_id',
  })
  baggingItemId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bagging_id',
  })
  baggingId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_item_id',
  })
  bagItemId: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

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
}
