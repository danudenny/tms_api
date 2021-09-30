import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AwbStatus } from './awb-status';

import { DoPodReturnDetail } from './do-pod-return-detail';
import { Employee } from './employee';
import { Reason } from './reason';
import { TmsBaseEntity } from './tms-base';

@Entity('do_pod_return_history', { schema: 'public' })
export class DoPodReturnHistory extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_return_history_id',
  })
  doPodReturnHistoryId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_pod_return_detail_id',
  })
  doPodReturnDetailId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: number;

  @Column('bigint', {
    nullable: true,
    name: 'reason_id',
  })
  reasonId: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'awb_status_date_time',
  })
  awbStatusDateTime: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'history_date_time',
  })
  historyDateTime: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id_driver',
  })
  employeeIdDriver: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'sync_date_time',
  })
  syncDateTime: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'longitude_return',
  })
  longitudeReturn: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'latitude_return',
  })
  latitudeReturn: string | null;

  @Column('text', {
    nullable: true,
  })
  desc: string | null;

  @ManyToOne(() => DoPodReturnDetail)
  @JoinColumn({ name: 'do_pod_return_detail_id' })
  doPodReturnDetail: DoPodReturnDetail;

  @OneToOne(() => Reason)
  @JoinColumn({ name: 'reason_id', referencedColumnName: 'reasonId' })
  reason: Reason;

  @OneToOne(() => AwbStatus)
  @JoinColumn({ name: 'awb_status_id' })
  awbStatus: AwbStatus;

  @OneToOne(() => Employee, employee => employee, { nullable: true })
  @JoinColumn({ name: 'employee_id_driver', referencedColumnName: 'employeeId' })
  employee: Employee;
}
