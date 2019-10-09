import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TmsBaseEntity } from './tms-base';

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
}
