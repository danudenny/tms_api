import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { TransactionStatus } from './transaction-status';
import { Branch } from './branch';
import { User } from './user';

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

  @Column('character varying', {
    nullable: false,
    length: 20,
    name: 'transaction_type',
  })
  transactionType: string;

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

  @Column('character varying', {
    nullable: true,
    name: 'cod_bank_statement_id',
  })
  codBankStatementId: string;

  @ManyToOne(() => TransactionStatus)
  @JoinColumn({ name: 'transaction_status_id' })
  transactionStatus: TransactionStatus;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  userAdmin: User;
}
