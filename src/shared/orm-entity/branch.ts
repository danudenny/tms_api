import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('branch', { schema: 'public' })
export class Branch extends BaseEntity {
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

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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

  // TODO: mapping for join on scaninlist
  // @OneToOne(() => PodScan)
  // @JoinColumn({ name: 'branch_id', referencedColumnName: 'branch_id' })
  // pod_scan: PodScan;

  // @OneToOne(() => DoPod)
  // @JoinColumn({ name: 'branch_id', referencedColumnName: 'branch_id' })
  // do_pod: DoPod;
}
