import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('commission_type', { schema: 'public' })
export class CommissionType extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'commission_type_id',
  })
  commissionTypeId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'commission_type_name',
  })
  commissionTypeName: string;

  @Column('bigint', {
    nullable: true,
    name: 'partner_id',
  })
  partnerId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 50,
    name: 'commission_type',
  })
  commissionType: string;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'commission_value',
  })
  commissionValue: number | null;

  @Column('numeric', {
    nullable: true,
    precision: 10,
    scale: 5,
    name: 'commission_percent_value',
  })
  commissionPercentValue: number | null;
}
