import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('cod_transaction_branch', { schema: 'public' })
export class CodTransactionBranch extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_transaction_branch_id',
  })
  codTransactionBranchId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'transaction_code',
  })
  transactionCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'transaction_date',
  })
  transactionDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @Column('integer', {
    nullable: false,
    name: 'total_awb',
  })
  totalAwb: number;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'total_cod_value',
  })
  totalCodValue: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;
}
