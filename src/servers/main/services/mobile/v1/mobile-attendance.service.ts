import { IsNull } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EmployeeAttendance } from '../../../../../shared/orm-entity/employee-attendance';
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import { MobileAttendanceInPayloadVm } from '../../../models/mobile-attendance-in-payload.vm';
import { MobileAttendanceInResponseVm } from '../../../models/mobile-attendance-in-response.vm';
import { MobileAttendanceOutPayloadVm } from '../../../models/mobile-attendance-out-payload.vm';
import { MobileAttendanceOutResponseVm } from '../../../models/mobile-attendance-out-response.vm';
import moment = require('moment');

export class V1MobileAttendanceService {
  constructor() {}

  static async checkInAttendance(
    payload: MobileAttendanceInPayloadVm,
    file,
  ): Promise<MobileAttendanceInResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileAttendanceInResponseVm();
      const branchName = 'Kantor Pusat';
      let status = 'ok';
      let message = 'success';
      let attachmentId = null;

      const timeNow = moment().toDate();

      const attendanceCheckOutExist = await EmployeeAttendance.findOne(
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
      if (attendanceCheckOutExist) {
        status = 'error';
        message = 'Check In sedang aktif, Harap CheckOut terlebih dahulu';
      } else {
        // upload image
        const attachment = await AttachmentService.uploadFileBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype,
          'employee-check-in',
        );
        if (attachment) {
          attachmentId = attachment.attachmentTmsId;
        }

        const employeeJourney = EmployeeAttendance.create({
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
        await EmployeeAttendance.insert(employeeJourney);
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

  static async checkOutAttendance(
    payload: MobileAttendanceOutPayloadVm,
    file,
  ): Promise<MobileAttendanceOutResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileAttendanceOutResponseVm();
      const branchName = 'Kantor Pusat';
      let status = 'ok';
      let message = 'success';
      let attachmentId = null;

      const timeNow = moment().toDate();

      const employeeAttendance = await EmployeeAttendance.findOne({
        where: {
          employeeId: authMeta.employeeId,
          checkOutDate: IsNull(),
        },
        order: {
          checkInDate: 'DESC',
        },
      });
      if (employeeAttendance) {
        // upload image
        const attachment = await AttachmentService.uploadFileBufferToS3(
          file.buffer,
          file.originalname,
          file.mimetype,
          'employee-check-out',
        );
        if (attachment) {
          attachmentId = attachment.attachmentTmsId;
        }

        await EmployeeAttendance.update(
          employeeAttendance.employeeAttendanceId,
          {
            latitudeCheckOut: payload.latitudeCheckOut,
            longitudeCheckOut: payload.longitudeCheckOut,
            attachmentIdCheckOut: attachmentId,
            checkOutDate: timeNow,
          },
        );
      } else {
        status = 'error';
        message = 'Data tidak ditemukan, Harap Check In terlebih dahulu';
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
