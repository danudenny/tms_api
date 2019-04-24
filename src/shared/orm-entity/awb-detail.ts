import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_detail', { schema: 'public' })
export class AwbDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_detail_id: string;

  @Column('bigint', {
    nullable: false,
  })
  awb_id: string;

  @Column('bigint', {
    nullable: false,
  })
  attachment_id: string;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  width: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  length: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  height: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  volume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  divider_volume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_volume: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_volume_rounded: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_rounded: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
  })
  weight_final: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  item_price: string | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
  })
  insurance: string | null;

  @Column('bigint', {
    nullable: false,
  })
  users_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,
  })
  users_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: true,
  })
  updated_time: Date | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;

  @Column('bigint', {
    nullable: true,
  })
  bag_item_id_latest: string | null;
}
