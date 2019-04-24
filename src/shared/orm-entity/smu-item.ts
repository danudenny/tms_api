import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('smu_item', { schema: 'public' })
export class SmuItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'smu_item_id',
  })
  smuItemId: string;

  @Column('bigint', {
    nullable: false,
    name: 'smu_id',
  })
  smuId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bagging_id',
  })
  baggingId: string;

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

  @Column('bigint', {
    nullable: true,
    name: 'do_smu_id_delivery',
  })
  doSmuIdDelivery: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'do_smu_id_pickup',
  })
  doSmuIdPickup: string | null;
}
