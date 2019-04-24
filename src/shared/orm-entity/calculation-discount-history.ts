import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('calculation_discount_history', { schema: 'public' })
export class CalculationDiscountHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  calculation_discount_history_id: string;

  @Column('bigint', {
    nullable: true,

  })
  calculation_discount_id: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  awb_number: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,

  })
  price: string | null;

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
