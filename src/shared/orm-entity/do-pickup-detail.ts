import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_pickup_detail', { schema: 'public' })
@Index('do_pickup_detail_work_order_id_idx', ['workOrderId'])
export class DoPickupDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_pickup_detail_id',
  })
  doPickupDetailId: string;

  @Column('bigint', {
    nullable: false,
    name: 'do_pickup_id',
  })
  doPickupId: string;

  @Column('bigint', {
    nullable: true,
    name: 'work_order_id',
  })
  workOrderId: string | null;

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
