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

@Entity('cod_transaction_history', { schema: 'public' })
export class CodTransactionHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'cod_transaction_history_id',
  })
  codTransactionHistoryId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

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
    name: 'visibility',
  })
  visibility: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

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
}
