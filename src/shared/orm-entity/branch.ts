import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { PodScan } from './pod-scan';
import { DoPod } from './do-pod';

@Entity('branch', { schema: 'public' })
export class Branch extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: true,
  })
  branch_id_parent: string | null;

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
  })
  district_id: string | null;

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

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_head_office: boolean | null;

  @Column('bigint', {
    nullable: true,
  })
  representative_id: string | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_delivery: boolean | null;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  is_pickup: boolean | null;

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
  })
  code_rds: Object | null;

  @Column('bigint', {
    nullable: true,
  })
  branch_type_id: string | null;

  // @OneToOne(() => PodScan)
  // @JoinColumn({ name: 'branch_id', referencedColumnName: 'branch_id' })
  // pod_scan: PodScan;

  // @OneToOne(() => DoPod)
  // @JoinColumn({ name: 'branch_id', referencedColumnName: 'branch_id' })
  // do_pod: DoPod;
}
