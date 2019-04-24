import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('calculation_discount', { schema: 'public' })
export class CalculationDiscount extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  calculation_discount_id: string;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  awb_date: Date | null;

  @Column('bigint', {
    nullable: true,

  })
  awb_price_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  awb_number: string | null;

  @Column('bigint', {
    nullable: true,

  })
  customer_account_id: string | null;

  @Column('integer', {
    nullable: true,

  })
  status_calculation: number | null;

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
