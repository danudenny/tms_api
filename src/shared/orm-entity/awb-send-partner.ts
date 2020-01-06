import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
// import { BagItem } from './bag-item';
import { TmsBaseEntity } from './tms-base';
// import { Representative } from './representative';
// import { District } from './district';
// import { PodScanInBranchBag } from './pod-scan-in-branch-bag';
// import { PodScanInBranchDetail } from './pod-scan-in-branch-detail';
// import { DropoffHub } from './dropoff_hub';
// import { DropoffSortation } from './dropoff_sortation';
// import { Branch } from './branch';

@Entity('awb_send_partner', { schema: 'public' })
// @Index('bag_bag_date_idx', ['bagDate'])
// @Index('bag_bag_number_idx', ['bagNumber'])
// @Index('bag_branch_id_idx', ['branchId'])
// @Index('bag_created_time_idx', ['createdTime'])
// @Index('bag_is_deleted_idx', ['isDeleted'])
export class AwbSendPartner extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_send_partner_id',
  })
  awbSendPartnerId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('character varying',{
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_send',
  })
  isSend: boolean;

  @Column('int', {
    nullable: false,
    default: () => 0,
    name: 'send_count',
  })
  sendCount: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'last_send_date_time',
  })
  lastSendDateTime: Date;

  @Column('character varying',{
    nullable: true,
    length: 3,
    name: 'response_code',
  })
  responseCode: string;

  @Column('text',{
    nullable: true,
    name: 'response_data',
  })
  responseData: string;

  @Column('text',{
    nullable: true,
    name: 'send_data',
  })
  sendData: string;

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

  // relation model
  // @OneToMany(() => BagItem, e => e.bag, { cascade: ['insert'] })
  // bagItems: BagItem[];

  // @OneToMany(() => PodScanInBranchBag, e => e.bag, { cascade: ['insert'] })
  // podScanInBranchBags: PodScanInBranchBag[];

  // @OneToMany(() => PodScanInBranchDetail, e => e.bag, { cascade: ['insert'] })
  // podScanInBranchDetails: PodScanInBranchDetail[];

  // @OneToMany(() => DropoffHub, e => e.bag, { cascade: ['insert'] })
  // dropoffHubs: DropoffHub[];

  // @OneToMany(() => DropoffSortation, e => e.bag, { cascade: ['insert'] })
  // dropoffSortations: DropoffSortation[];

  // @OneToOne(() => Representative)
  // @JoinColumn({ name: 'representative_id_to' })
  // representative: Representative;

  // @OneToOne(() => District)
  // @JoinColumn({ name: 'district_id_to' })
  // district: District;

  // @OneToOne(() => Branch)
  // @JoinColumn({ name: 'branch_id' })
  // branch: Branch;
}
