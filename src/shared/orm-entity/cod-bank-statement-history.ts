import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { TransactionStatus } from './transaction-status';
import { User } from './user';

@Entity('cod_bank_statement_history', { schema: 'public' })
export class CodBankStatementHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_bank_statement_history_id',
  })
  codBankStatementHistoryId: string;

  @Column('character varying', {
    nullable: false,
    name: 'cod_bank_statement_id',
  })
  codBankStatementId: string;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

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
    name: 'bank_branch_id',
  })
  bankBranchId: number;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'bank_account',
  })
  bankAccount: string;

  @Column('bigint', {
    nullable: false,
    name: 'attachment_id',
  })
  attachmentId: number;

  // relation
  @ManyToOne(() => TransactionStatus)
  @JoinColumn({ name: 'transaction_status_id' })
  transactionStatus: TransactionStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created' })
  userAdmin: User;
}
