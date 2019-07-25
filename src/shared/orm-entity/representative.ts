import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('representative', { schema: 'public' })
export class Representative extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'representative_id',
  })
  representativeId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'representative_code',
  })
  representativeCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'representative_name',
  })
  representativeName: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'email',
  })
  email: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'min_weight',
  })
  minWeight: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'price_per_kg',
  })
  pricePerKg: string;

  @Column('bigint', {
    nullable: true,
    name: 'representative_id_parent',
  })
  representativeIdParent: string | null;
}
