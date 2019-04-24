import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bagging', { schema: 'public' })
@Index('bagging_representative_id_to_idx', ['representative_id_to'])
@Index('bagging_smu_id_last_idx', ['smu_id_last'])
export class Bagging extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  bagging_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  bagging_code: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  representative_id_to: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  product_code: string | null;

  @Column('date', {
    nullable: false,

  })
  bagging_date: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  bagging_date_real: Date;

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
  smu_id_last: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  bagging_seq: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_item: number;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,

  })
  total_weight: string | null;

  @Column('bigint', {
    nullable: true,

  })
  smu_item_id_last: string | null;
}
