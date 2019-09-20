import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('pod_scan_in_hub', { schema: 'public' })
export class PodScanInHub extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'pod_scan_in_hub_id',
  })
  podScanInHubId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  scanInType: string;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;
}
