import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('branch_child_partner', { schema: 'public' })
export class BranchChildPartner extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'branch_child_partner_id',
  })
  branchChildPartnerId: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_partner_id',
  })
  branchPartnerId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_child_partner_code',
  })
  branchChildPartnerCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_child_partner_name',
  })
  branchChildPartnerName: string;

  @Column('text', {
    nullable: true,
    name: 'address',
  })
  address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'phone',
  })
  phone: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude',
  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude',
  })
  longitude: string | null;
}
