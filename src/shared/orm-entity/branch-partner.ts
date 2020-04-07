import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('branch_partner', { schema: 'public' })
export class BranchPartner extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'branch_partner_id',
  })
  branchPartnerId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_partner_code',
  })
  branchPartnerCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_partner_name',
  })
  branchPartnerName: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'partner_id',
  })
  partnerId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'address',
  })
  address: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'phone',
  })
  phone: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'latitude',
  })
  latitude: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'longitude',
  })
  longitude: string;
}
