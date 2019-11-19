import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { IsNull } from 'typeorm';

import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { EmployeeJourneyRepository } from '../../../../shared/orm-repository/employee-journey.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { MobileAttendanceInPayloadVm } from '../../models/mobile-attendance-in-payload.vm';
import { MobileAttendanceOutPayloadVm } from '../../models/mobile-attendance-out-payload.vm';
import { MobileAttendanceInResponseVm } from '../../models/mobile-attendance-in-response.vm';
import { MobileAttendanceOutResponseVm } from '../../models/mobile-attendance-out-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MobileAtendanceListResponseVm } from '../../models/mobile-attendance-list-response.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { EmployeeJourney } from '../../../../shared/orm-entity/employee-journey';
import { MetaService } from '../../../../shared/services/meta.service';
import { Attachment } from 'src/shared/orm-entity/attachment';

@Injectable()
export class MobileAttendanceService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(EmployeeJourneyRepository)
    private readonly employeeJourneyRepository: EmployeeJourneyRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
  ) {}

  // TODO: unused method
  async checkInAttendance(
    payload: MobileAttendanceInPayloadVm,
    file,
  ): Promise<MobileAttendanceInResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileAttendanceInResponseVm();
      let status = 'ok';
      let message = 'success';
      let branchName = '';
      let checkInDate = '';
      let attachmentId = null;

      const timeNow = moment().toDate();

      // console.log(payload);
      const permissonPayload = AuthService.getPermissionTokenPayload();

      const employeeJourneyCheckOutExist = await this.employeeJourneyRepository.findOne(
        {
          where: {
            employeeId: authMeta.employeeId,
            checkOutDate: IsNull(),
          },
          order: {
            checkInDate: 'DESC',
          },
        },
      );
      if (employeeJourneyCheckOutExist) {
        status = 'error';
        message = 'Check In sedang aktif, Harap CheckOut terlebih dahulu';
      } else {
        // upload image
        const attachment = await AttachmentService.uploadFileBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype,
          'Driver-check-in',
        );
        if (attachment) {
          attachmentId = attachment.attachmentTmsId;
        }
        const branch = await this.branchRepository.findOne({
          where: { branchCode: payload.branchCode },
        });

        const employeeJourney = this.employeeJourneyRepository.create({
          employeeId: authMeta.employeeId,
          checkInDate: timeNow,
          latitudeCheckIn: payload.latitudeCheckIn,
          longitudeCheckIn: payload.longitudeCheckIn,
          userIdCreated: authMeta.userId,
          createdTime: timeNow,
          branchIdCheckIn: branch.branchId,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
          attachmentIdCheckIn: attachmentId,
        });
        await this.employeeJourneyRepository.save(employeeJourney);

        branchName = branch.branchName;
        checkInDate = moment().format('YYYY-MM-DD HH:mm:ss');
      }
      result.status = status;
      result.message = message;
      result.branchName = branchName;
      return result;
    } else {
      RequestErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async listAttendance(
    payload: BaseMetaPayloadVm,
  ): Promise<MobileAtendanceListResponseVm> {
    // mapping field
    payload.fieldResolverMap['employeeId'] = 't1.employee_id';
    payload.fieldResolverMap['checkInDate'] = 't1.check_in_date';
    payload.fieldResolverMap['checkOutDate'] = 't1.check_out_date';
    payload.fieldResolverMap['branchIdCheckIn'] = 't1.branch_id_check_in';
    payload.fieldResolverMap['branchIdCheckOut'] = 't1.branch_id_check_out';
    payload.fieldResolverMap['attachmentTmsId'] = 't2.attachment_tms_id';
    payload.fieldResolverMap['urlCheckIn'] = 't2.url';
    payload.fieldResolverMap['urlCheckOut'] = 't2.url';
    payload.fieldResolverMap['longitudeCheckIn'] = 't1.longitude_check_in';
    payload.fieldResolverMap['longitudeCheckOut'] = 't1.longitude_check_out';
    payload.fieldResolverMap['latitudeCheckIn'] = 't1.latitude_check_in';
    payload.fieldResolverMap['latitudeCheckOut'] = 't1.latitude_check_out';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchId'] = 't4.branch_id';

    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }
    payload.globalSearchFields = [
      {
        field: 'fullname',
      },
    ];

    const repo = new OrionRepositoryService(EmployeeJourney, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['t1.employee_id', 'employeeId'],
      ['t3.fullname', 'fullname'],
      ['t1.check_in_date', 'checkInDate'],
      ['t1.check_out_date', 'checkOutDate'],
      ['t4.branch_name', 'branchNameCheckIn'],
      ['t6.branch_name', 'branchNameCheckOut'],
      ['t1.longitude_check_in', 'longitudeCheckIn'],
      ['t1.longitude_check_out', 'longitudeCheckOut'],
      ['t1.latitude_check_in', 'latitudeCheckIn'],
      ['t1.latitude_check_out', 'latitudeCheckOut'],
      ['t1.created_time', 'createdTime'],
      ['t2.url', 'urlCheckIn'],
      ['t5.url', 'urlCheckOut'],
      ['t7.branch_name', 'branchAsalDriver'],
    );

    q.leftJoin(e => e.branchCheckIn, 't4',
    );

    q.leftJoin(e => e.branchCheckOut, 't6',
    );

    q.leftJoin(e => e.employee, 't3',
    );

    q.leftJoin(e => e.employee.branch, 't7',
    );

    q.leftJoin(e => e.attachmentCheckIn, 't2',
    );

    q.leftJoin(e => e.attachmentCheckOut, 't5', j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new MobileAtendanceListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);
    return result;
  }

  async checkOutAttendance(
    payload: MobileAttendanceOutPayloadVm,
    file,
  ): Promise<MobileAttendanceOutResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileAttendanceOutResponseVm();
      const status = 'ok';
      const message = 'success';
      let branchName = '';
      let checkInDate = '';
      let attachmentId = null;

      const timeNow = moment().toDate();

      // console.log(payload);
      const permissonPayload = AuthService.getPermissionTokenPayload();

      const employeeJourney = await this.employeeJourneyRepository.findOne(
        {
          where: {
            employeeId: authMeta.employeeId,
            checkOutDate: IsNull(),
          },
          order: {
            checkInDate: 'DESC',
          },
        },
      );
      if (employeeJourney) {
        // upload image
        const attachment = await AttachmentService.uploadFileBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype,
          'Driver-check-Out',
        );
        if (attachment) {
          attachmentId = attachment.attachmentTmsId;
        }
        const branchOut = await this.branchRepository.findOne({
          where: { branchCode: payload.branchCode },
        });
        employeeJourney.branchIdCheckOut = branchOut.branchId;
        employeeJourney.latitudeCheckOut =  payload.latitudeCheckOut;
        employeeJourney.longitudeCheckOut =  payload.longitudeCheckOut;
        employeeJourney.attachmentIdCheckOut = attachmentId;
        employeeJourney.checkOutDate = timeNow;

        await this.employeeJourneyRepository.save(employeeJourney);

        branchName = branchOut.branchName;
        checkInDate = moment().format('YYYY-MM-DD HH:mm:ss');
      }
      result.status = status;
      result.message = message;
      result.branchName = branchName;
      return result;
    } else {
      RequestErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
