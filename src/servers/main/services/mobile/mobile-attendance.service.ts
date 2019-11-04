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
import { MobileCheckOutResponseVm } from '../../models/mobile-check-out-response.vm';

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
          'Driver check-in',
        );
        if (attachment) {
          attachmentId = attachment.attachmentTmsId;
        }
        const employeeJourney = this.employeeJourneyRepository.create({
          employeeId: authMeta.employeeId,
          checkInDate: timeNow,
          latitudeCheckIn: payload.latitudeCheckIn,
          longitudeCheckIn: payload.longitudeCheckIn,
          userIdCreated: authMeta.userId,
          createdTime: timeNow,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
          attachmentIdCheckIn: attachmentId,
        });
        await this.employeeJourneyRepository.save(employeeJourney);

        const branch = await this.branchRepository.findOne({
          select: ['branchName'],
          where: { branchId: permissonPayload.branchId },
        });
        branchName = branch.branchName;
        checkInDate = moment().format('YYYY-MM-DD HH:mm:ss');
      }
      result.status = status;
      result.message = message;
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

  async checkOutAttendance(
    payload: MobileAttendanceOutPayloadVm,
    file,
  ): Promise<MobileAttendanceOutResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileAttendanceOutResponseVm();
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
          'Driver check-Out',
        );
        if (attachment) {
          attachmentId = attachment.attachmentTmsId;
        }
        const employeeJourney = this.employeeJourneyRepository.create({
          employeeId: authMeta.employeeId,
          checkInDate: timeNow,
          latitudeCheckOut: payload.latitudeCheckOut,
          longitudeCheckOut: payload.longitudeCheckOut,
          userIdCreated: authMeta.userId,
          createdTime: timeNow,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
          attachmentIdCheckIn: attachmentId,
        });
        await this.employeeJourneyRepository.save(employeeJourney);

        const branch = await this.branchRepository.findOne({
          select: ['branchName'],
          where: { branchId: permissonPayload.branchId },
        });
        branchName = branch.branchName;
        checkInDate = moment().format('YYYY-MM-DD HH:mm:ss');
      }
      result.status = status;
      result.message = message;
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
