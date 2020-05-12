import { createQueryBuilder } from 'typeorm';
import { ReportAttendancePayloadVm } from '../../models/report-attendance-in-payload.vm';

export class ReportAttendanceService {
  constructor(
  ) {}

  public static async reportListAttendance(
    payload: ReportAttendancePayloadVm,
  ) {
    const qb = createQueryBuilder();
    qb.addSelect('t1.employee_id', 'employeeId');
    qb.addSelect('t3.nik', 'nik');
    qb.addSelect('t3.fullname', 'fullname');
    qb.addSelect('t7.branch_name', 'branchName');
    qb.addSelect('t1.check_in_date', 'checkInDate');
    qb.addSelect('t1.check_out_date', 'checkOutDate');
    qb.addSelect('t4.branch_name', 'branchNameCheckIn');
    qb.addSelect('t6.branch_name', 'branchNameCheckOut');
    qb.addSelect('t1.longitude_check_in', 'longitudeCheckIn');
    qb.addSelect('t1.longitude_check_out', 'longitudeCheckOut');
    qb.addSelect('t1.latitude_check_in', 'latitudeCheckIn');
    qb.addSelect('t1.latitude_check_out', 'latitudeCheckOut');
    qb.addSelect('t1.created_time', 'createdTime');
    qb.from('employee_journey', 't1');
    qb.leftJoin(
      'branch',
      't4',
      't4.branch_id = t1.branch_id_check_in',
    );
    qb.leftJoin(
      'branch',
      't6',
      't6.branch_id=t1.branch_id_check_out',
    );
    qb.leftJoin(
      'employee',
      't3',
      't3.employee_id=t1.employee_id',
    );
    qb.leftJoin(
      'branch',
      't7',
      't7.branch_id=t3.branch_id',
    );
    qb.leftJoin(
      'attachment_tms',
      't2',
      't2.attachment_tms_id=t1.attachment_id_check_in',
    );
    qb.leftJoin(
      'attachment_tms',
      't5',
      't5.attachment_tms_id=t1.attachment_id_check_in',
    );
    qb.where('t1.created_time >= :startDate AND t1.created_time <= :endDate',
    {startDate: payload.startDate, endDate: payload.endDate});

    const result = await qb.getRawMany();
    return result;
   }
  }
