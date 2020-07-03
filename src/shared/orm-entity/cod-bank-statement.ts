import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { TransactionStatus } from './transaction-status';
import { Branch } from './branch';
import { User } from './user';
import { AttachmentTms } from './attachment-tms';
import { CodTransactionBranch } from './cod-transaction-branch';

@Entity('cod_bank_statement', { schema: 'public' })
export class CodBankStatement extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_bank_statement_id',
  })
  codBankStatementId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'bank_statement_code',
  })
  bankStatementCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'bank_statement_date',
  })
  bankStatementDate: Date;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'bank_account',
  })
  bankAccount: string;

  @Column('numeric', {
    nullable: false,
    default: () => 0,
    precision: 20,
    scale: 5,
    name: 'total_cod_value',
  })
  totalCodValue: number;

  @Column('integer', {
    nullable: false,
    name: 'total_transaction',
  })
  totalTransaction: number;

  @Column('integer', {
    nullable: false,
    name: 'total_awb',
  })
  totalAwb: number;

  @Column('bigint', {
    nullable: false,
    name: 'bank_branch_id',
  })
  bankBranchId: number;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_id',
  })
  attachmentId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'cancel_datetime',
  })
  cancelDatetime: Date;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'bank_no_reference',
  })
  bankNoReference: string;

  // relation
  @ManyToOne(() => TransactionStatus)
  @JoinColumn({ name: 'transaction_status_id' })
  transactionStatus: TransactionStatus;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  userAdmin: User;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({ name: 'attachment_id' })
  attachment: AttachmentTms;

  @OneToMany(() => CodTransactionBranch, x => x.bankStatement)
  transactions: CodTransactionBranch[];
}
