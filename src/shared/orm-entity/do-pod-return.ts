import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch';
import { DoPodReturnDetail } from './do-pod-return-detail';
import { TmsBaseEntity } from './tms-base';
import { User } from './user';

@Entity('do_pod_return', {schema: 'public'})
export class DoPodReturn extends TmsBaseEntity {

  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_return_id',
  })
  doPodReturnId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'do_pod_return_code',
  })
  doPodReturnCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_pod_return_date_time',
  })
  doPodReturnDateTime: Date;

  @Column('text', {
    nullable: true,
  })
  description: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_driver',
  })
  userIdDriver: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id',
  })
  userId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('integer', {
    nullable: false,
    name: 'total_awb',
  })
  totalAwb: number | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_return',
  })
  totalReturn: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_mobile',
  })
  isMobile: boolean;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_problem',
  })
  totalProblem: number;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => DoPodReturnDetail, e => e.doPodReturn)
  doPodReturnDetails: DoPodReturnDetail[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_driver', referencedColumnName: 'userId' })
  userDriver: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id_created', referencedColumnName: 'userId' })
  userCreated: User;
}
