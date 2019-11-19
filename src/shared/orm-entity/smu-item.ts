import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('smu_item', { schema: 'public' })
export class SmuItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  smu_item_id: string;

  @Column('bigint', {
    nullable: false,

  })
  smu_id: string;

  @Column('bigint', {
    nullable: false,

  })
  bagging_id: string;

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
  do_smu_id_delivery: string | null;

  @Column('bigint', {
    nullable: true,

  })
  do_smu_id_pickup: string | null;
}
