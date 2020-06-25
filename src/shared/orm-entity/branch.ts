import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { District } from './district';

@Entity('branch', { schema: 'public' })
export class Branch extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_parent',
  })
  branchIdParent: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  lft: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
  })
  rgt: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',
  })
  depth: number;

  @Column('integer', {
    nullable: false,
    default: () => '1',
  })
  priority: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_code',
  })
  branchCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_name',
  })
  branchName: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  phone1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  phone2: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  mobile1: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  mobile2: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'district_id',
  })
  districtId: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_head_office',
  })
  isHeadOffice: boolean | null;

  @Column('bigint', {
    nullable: true,
    name: 'representative_id',
  })
  representativeId: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_delivery',
  })
  isDelivery: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_pickup',
  })
  isPickup: boolean | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  latitude: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  longitude: string | null;

  @Column('jsonb', {
    nullable: true,
    name: 'code_rds',
  })
  codeRds: Object | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_type_id',
  })
  branchTypeId: number | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean | null;

  @OneToOne(() => District)
  @JoinColumn({ name: 'district_id' })
  district: District;

  // TODO: mapping for join on scaninlist
  // @OneToOne(() => PodScan)
  // @JoinColumn({ name: 'branch_id', referencedColumnName: 'branch_id' })
  // pod_scan: PodScan;

  // @OneToOne(() => DoPod)
  // @JoinColumn({ name: 'branch_id', referencedColumnName: 'branch_id' })
  // do_pod: DoPod;
}
