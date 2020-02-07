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

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'employee_journey_id',
  })
  employeeJourneyId: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'total_task',
  })
  totalTask: number | null;

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
