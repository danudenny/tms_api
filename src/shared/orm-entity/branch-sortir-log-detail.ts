import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { BagItemAwb } from './bag-item-awb';

@Entity('branch_sortir_log_detail', { schema: 'public' })
export class BranchSortirLogDetail extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'branch_sortir_log_detail_id',
  })
  branchSortirLogDetailId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'scan_date',
  })
  scanDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'seal_number',
  })
  sealNumber: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('integer', {
    nullable: true,
    name: 'no_chute',
  })
  noChute: number;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id_lastmile',
  })
  branchIdLastmile: number;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_cod',
  })
  isCod: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_succeed',
  })
  isSucceed: boolean;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'reason',
  })
  reason: string | null;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id_lastmile' })
  branchLastmile: Branch;

  @OneToOne(() => BagItemAwb)
  @JoinColumn({ name: 'awb_number', referencedColumnName: 'awbNumber' })
  bagItemAwb: BagItemAwb;
}
