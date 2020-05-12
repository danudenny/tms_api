import { Column, Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { User } from './user';
import { EmployeeJourney } from './employee-journey';
import { KorwilTransactionDetail } from './korwil-transaction-detail';
import { UserToBranch } from './user-to-branch';

@Entity('korwil_transaction', { schema: 'public' })
export class KorwilTransaction extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'korwil_transaction_id',
  })
  korwilTransactionId: string;

  @Column('timestamp with time zone', {
    nullable: true,
    name: 'date',
  })
  date: Date;

  @Column('uuid', {
    nullable: false,
    name: 'employee_journey_id',
  })
  employeeJourneyId: string | null;

  @Column('uuid', {
    nullable: false,
    name: 'user_to_branch_id',
  })
  userToBranchId: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('integer', {
    nullable: true,
    name: 'total_task',
  })
  totalTask: number | null;

  @Column('integer', {
    nullable: true,
    name: 'total_task_done',
  })
  totalTaskDone: number | null;

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

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branches: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  users: User;

  @ManyToOne(() => UserToBranch, e => e.korwilTransaction)
  @JoinColumn({ name: 'user_to_branch_id' })
  userToBranch: UserToBranch;

  @OneToMany(() => KorwilTransactionDetail, e => e.korwilTransaction)
  @JoinColumn({ name: 'korwil_transaction_id', referencedColumnName: 'korwilTransactionId' })
  korwilTransactionDetail: KorwilTransactionDetail[];

  @OneToOne(() => EmployeeJourney)
  @JoinColumn({ name: 'employee_journey_id' })
  employeeJourney: EmployeeJourney;
}
