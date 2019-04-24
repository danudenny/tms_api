import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('smu', { schema: 'public' })
export class Smu extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  smu_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  smu_code: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  smu_airline_number: string | null;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  smu_date_time: Date;

  @Column('bigint', {
    nullable: true,

  })
  airline_id: string | null;

  @Column('bigint', {
    nullable: false,

  })
  representative_id: string;

  @Column('bigint', {
    nullable: false,

  })
  user_id: string;

  @Column('bigint', {
    nullable: false,

  })
  branch_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  flight_number: string | null;

  @Column('text', {
    nullable: true,

  })
  note: string | null;

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

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => '\'2018-09-18 11:01:58\'',

  })
  departure_time: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => '\'2018-09-18 11:01:58\'',

  })
  arrival_time: Date;

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

  @Column('date', {
    nullable: true,

  })
  smu_date: string | null;

  @Column('bigint', {
    nullable: true,

  })
  do_smu_id_delivery: string | null;

  @Column('bigint', {
    nullable: true,

  })
  do_smu_id_pickup: string | null;
}
