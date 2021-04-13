import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'; 

import { TmsBaseEntity } from './tms-base';
import { District } from './district';
import { Representative } from './representative';

@Entity('branch_sortir', { schema: 'public' })
export class BranchSortir extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'branch_sortir_id',
  })
  branchSortirId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_sortir_code',
  })
  branchSortirCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_sortir_name',
  })
  branchSortirName: string;

  @Column('bigint', {
    nullable: false,
    name: 'no_chute',
  })
  noChute: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id_lastmile',
  })
  branchIdLastmile: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_cod',
  })
  isCod: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

}
