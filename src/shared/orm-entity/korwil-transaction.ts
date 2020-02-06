import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { User } from './user';

@Entity('korwil_transaction', { schema: 'public' })
export class KorwilTransaction extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'korwil_transaction_id',
  })
  korwilTransactionId: number;

  @Column('timestamp with time zone', {
    nullable: true,
    name: 'date',
  })
  date: Date;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id',
  })
  userId: number | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'status',
  })
  status: number | null;

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

  @OneToMany(() => Branch, e => e.branchId)
  branches: Branch[];

  @OneToMany(() => User, e => e.userId)
  users: User[];
}
