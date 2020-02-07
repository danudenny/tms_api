import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { Branch } from './branch';
import { User } from './user';
import { KorwilTransaction } from './korwil-transaction';

@Entity('korwil_transaction_detail', { schema: 'public' })
export class KorwilTransactionDetail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'korwil_transaction_detail_id',
  })
  korwilTransactionDetailId: string;

  @Column('uuid', {
    nullable: false,
    name: 'korwil_transaction_id',
  })
  korwilTransactionId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'korwil_item_id',
  })
  korwilItemId: number | null;

  @Column('timestamp with time zone', {
    nullable: true,
    name: 'date',
  })
  date: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_done',
  })
  isDone: boolean;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'note',
  })
  note: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'status',
  })
  status: number | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'photo_count',
  })
  photoCount: number | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'longchecklist',
  })
  longChecklist: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'latchecklist',
  })
  latChecklist: string | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @ManyToOne(() => KorwilTransaction, e => e.korwilTransactionDetail)
  @JoinColumn({ name: 'korwil_transaction_id', referencedColumnName: 'korwilTransactionId' })
    korwilTransaction: KorwilTransaction;
}
