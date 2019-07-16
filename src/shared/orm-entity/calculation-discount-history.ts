import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('calculation_discount_history', { schema: 'public' })
export class CalculationDiscountHistory extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'calculation_discount_history_id',
  })
  calculationDiscountHistoryId: string;

  @Column('bigint', {
    nullable: true,
    name: 'calculation_discount_id',
  })
  calculationDiscountId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string | null;

  @Column('numeric', {
    nullable: true,
    default: () => '0',
    precision: 20,
    scale: 5,
  })
  price: string | null;

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
