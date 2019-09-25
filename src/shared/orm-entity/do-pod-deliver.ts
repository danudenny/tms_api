import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Branch } from './branch';
import { DoPodDeliverDetail } from './do-pod-deliver-detail';
import { Employee } from './employee';
import { TmsBaseEntity } from './tms-base';

@Entity('do_pod_deliver', { schema: 'public' })
export class DoPodDeliver extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_deliver_id',
  })
  doPodDeliverId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'do_pod_deliver_code',
  })
  doPodDeliverCode: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'ref_do_pod_deliver_code',
  })
  refDoPodDeliverCode: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_pod_deliver_date_time',
  })
  doPodDeliverDateTime: Date;

  @Column('integer', {
    nullable: false,
    name: 'total_awb',
  })
  totalAwb: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_driver',
  })
  userIdDriver: number | null;

  // @Column('bigint', {
  //   nullable: true,
  //   name: 'employee_id_driver',
  // })
  // employeeIdDriver: number | null;

  @Column('text', {
    nullable: true,
  })
  description: string | null;

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
    default: () => '0',
    name: 'total_delivery',
  })
  totalDelivery: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_problem',
  })
  totalProblem: number;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_created',
  })
  userIdCreated: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_updated',
  })
  userIdUpdated: number | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @OneToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => DoPodDeliverDetail, e => e.doPodDeliver)
  doPodDeliverDetails: DoPodDeliverDetail[];

  // @ManyToOne(() => Employee)
  // @JoinColumn({ name: 'user_id_driver' })
  // employee: Employee;
}
