import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { User } from './user';

@Entity('audit_history', { schema: 'public' })
export class AuditHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'audit_history_id',
  })
  auditHistoryId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'change_id',
  })
  changeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'note',
  })
  note: string;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created', referencedColumnName: 'userId' })
  userCreated: User;

}
