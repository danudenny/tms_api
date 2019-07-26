import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { User } from './user';
import { Representative } from './representative';

@Entity('pod_filter', { schema: 'public' })
export class PodFilter extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_filter_id',
  })
  podFilterId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'pod_filter_code',
  })
  podFilterCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'start_date_time',
  })
  startDateTime: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'end_date_time',
  })
  endDateTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_scan',
  })
  userIdScan: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_scan',
  })
  branchIdScan: number;

  @Column('bigint', {
    nullable: false,
    name: 'representative_id_filter',
  })
  representativeIdFilter: number;

  @Column('integer', {
    nullable: false,
    name: 'total_bag_item',
    default: () => 0,
  })
  totalBagItem: number | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean;

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

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_scan' })
  branch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_scan' })
  user: User;

  @ManyToOne(() => Representative)
  @JoinColumn({ name: 'representative_id_filter' })
  representative: Representative;

}
