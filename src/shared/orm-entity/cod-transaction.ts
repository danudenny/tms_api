import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { TransactionStatus } from './transaction-status';
import { Branch } from './branch';
import { User } from './user';
import { CodTransactionDetail } from './cod-transaction-detail';
import { CodBankStatement } from './cod-bank-statement';
import { CodUserToBranch } from './cod-user-to-branch';

@Entity('cod_transaction', { schema: 'public' })
export class CodTransaction extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_transaction_id',
  })
  codTransactionId: string;

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

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'transaction_note',
  })
  transactionNote: string | null;

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

  @Column('bigint', {
    nullable: false,
    name: 'user_id_driver',
  })
  userIdDriver: number;

  @Column('uuid', {
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
  @JoinColumn({ name: 'user_id_updated' })
  userAdmin: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_driver' })
  userDriver: User;

  @ManyToOne(() => CodBankStatement, x => x.transactions)
  @JoinColumn({
    name: 'cod_bank_statement_id',
    referencedColumnName: 'codBankStatementId',
  })
  bankStatement: CodBankStatement;

  @OneToMany(() => CodTransactionDetail, x => x.transactionBranch)
  details: CodTransactionDetail[];

  @OneToOne(() => CodUserToBranch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  codUserToBranch: CodUserToBranch;
}
