import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_pickup_detail', { schema: 'public' })
@Index('do_pickup_detail_work_order_id_idx', ['work_order_id'])
export class DoPickupDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  do_pickup_detail_id: string;

  @Column('bigint', {
    nullable: false,

  })
  do_pickup_id: string;

  @Column('bigint', {
    nullable: true,

  })
  work_order_id: string | null;

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
