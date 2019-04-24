import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_pickup', { schema: 'public' })
export class CustomerPickup extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_pickup_id: string;

  @Column('bigint', {
    nullable: true,

  })
  customer_id: string | null;

  @Column('bigint', {
    nullable: true,

  })
  district_id: string | null;

  @Column('text', {
    nullable: false,

  })
  address: string;

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
