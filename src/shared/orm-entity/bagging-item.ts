import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bagging_item', { schema: 'public' })
export class BaggingItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bagging_item_id: string;

  @Column('bigint', {
    nullable: false,

  })
  bagging_id: string;

  @Column('bigint', {
    nullable: false,

  })
  bag_item_id: string;

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
}
