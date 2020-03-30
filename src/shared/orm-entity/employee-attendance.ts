import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AttachmentTms } from './attachment-tms';
import { Employee } from './employee';
import { TmsBaseEntity } from './tms-base';

@Entity('employee_attendance', { schema: 'public' })
export class EmployeeAttendance extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'employee_attendance_id',
  })
  employeeAttendanceId: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_in_date',
  })
  checkInDate: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_out_date',
  })
  checkOutDate: Date | null;

  @Column('character varying', {
    nullable: false,
    name: 'latitude_check_in',
  })
  latitudeCheckIn: string;

  @Column('character varying', {
    nullable: false,
    name: 'longitude_check_in',
  })
  longitudeCheckIn: string;

  @Column('character varying', {
    nullable: false,
    name: 'latitude_check_out',
  })
  latitudeCheckOut: string | null;

  @Column('character varying', {
    nullable: false,
    name: 'longitude_check_out',
  })
  longitudeCheckOut: string | null;

  @Column('character varying', {
    nullable: true,
    name: 'category',
  })
  category: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_id_check_in',
  })
  attachmentIdCheckIn: number;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_id_check_out',
  })
  attachmentIdCheckOut: number;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({
    name: 'attachment_id_check_in',
    referencedColumnName: 'attachmentTmsId',
  })
  attachmentCheckIn: AttachmentTms;

  @OneToOne(() => AttachmentTms)
  @JoinColumn({
    name: 'attachment_id_check_out',
    referencedColumnName: 'attachmentTmsId',
  })
  attachmentCheckOut: AttachmentTms;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id', referencedColumnName: 'employeeId' })
  employee: Employee;
}
