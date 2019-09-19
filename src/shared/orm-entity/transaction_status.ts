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
  })
  statusCategory: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  statusCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  statusTitle: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  statusName: string;
}
