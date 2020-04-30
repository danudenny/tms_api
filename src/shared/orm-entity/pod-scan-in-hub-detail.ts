import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { PodScanInHub } from './pod-scan-in-hub';
import { Awb } from './awb';

@Entity('pod_scan_in_hub_detail', { schema: 'public' })
export class PodScanInHubDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'pod_scan_in_hub_detail_id',
  })
  podScanInHubDetailId: string;

  @Column('character varying', {
    name: 'pod_scan_in_hub_id',
  })
  podScanInHubId: string;

  @Column('bigint', {
    nullable: false,
    name: 'bag_id',
  })
  bagId: number;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_id',
  })
  awbId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'awb_item_id',
  })
  awbItemId: number | null;

  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'bag_number',
  })
  bagNumber: string;

  @ManyToOne(() => PodScanInHub)
  @JoinColumn({ name: 'pod_scan_in_hub_id', referencedColumnName: 'podScanInHubId' })
  podScanInHub: PodScanInHub;

  @OneToOne(() => Awb)
  @JoinColumn({ name: 'awb_id', referencedColumnName: 'awbId' })
  awb: Awb;
}
