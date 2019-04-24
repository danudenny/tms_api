import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_price_item', { schema: 'public' })
@Index('awb_price_item_awb_item_id_idx', ['awb_item_id'])
@Index('awb_price_item_awb_price_id_idx', ['awb_price_id'])
@Index('awb_price_item_updated_time_idx', ['updated_time'])
export class AwbPriceItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_price_item_id: string;

  @Column('bigint', {
    nullable: false,
  })
  awb_item_id: string;

  @Column('bigint', {
    nullable: false,
  })
  awb_price_id: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  weight_real: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  weight_final: string;

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
