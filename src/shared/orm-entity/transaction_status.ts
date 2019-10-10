import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('transaction_status', { schema: 'public' })
export class TransactionStatus extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'transaction_status_id',
  })
  transactionStatusId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status_category',
  })
  statusCategory: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status_code',
  })
  statusCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status_title',
  })
  statusTitle: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status_name',
  })
  statusName: string;
}
