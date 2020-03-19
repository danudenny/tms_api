import { IsNull } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EmployeeAttendance } from '../../../../../shared/orm-entity/employee-attendance';
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import { MobileAttendanceInPayloadVm } from '../../../models/mobile-attendance-in-payload.vm';
import {
  MobileAttendanceInResponseVm,
  MobileAttendanceInitResponseVm,
} from '../../../models/mobile-attendance-in-response.vm';
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

      const attendanceCheckOutExist = await EmployeeAttendance.findOne({
        where: {
          employeeId: authMeta.employeeId,
          checkOutDate: IsNull(),
        },
        order: {
          checkInDate: 'DESC',
        },
      });
      if (attendanceCheckOutExist) {
        status = 'error';
        message = 'anda sudah berhasil absen';
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
        message = `Anda berhasil masuk pada (${moment(timeNow).format(
          'DD MMM YYYY HH:mm:ss',
        )})`;
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
        message = `Anda berhasil pulang pada (${moment(
          timeNow,
        ).format('DD MMM YYYY HH:mm:ss')})`;
      } else {
        status = 'error';
        message =
          'belum melakukan absen masuk, silahkan absen masuk terlebih dahulu';
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

  public static async getInitData(
    fromDate?: string,
  ): Promise<MobileAttendanceInitResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = await this.getStatusCheckIn(authMeta.employeeId);

    return result;
  }

  private static async getStatusCheckIn(
    employeeId: number,
  ): Promise<MobileAttendanceInitResponseVm> {
    const result: MobileAttendanceInitResponseVm = {
      status: 'ok',
      message: 'success',
      checkInDate: '',
      attachmentId: null,
      isAttendanceIn: false,
    };

    const employeeAttendance = await EmployeeAttendance.findOne({
      where: {
        employeeId,
        checkOutDate: IsNull(),
      },
      order: {
        checkInDate: 'DESC',
      },
    });
    if (employeeAttendance) {
      result.status = 'error';
      result.isAttendanceIn = true;
      result.message = 'Sudah absen masuk';
      result.checkInDate = moment(employeeAttendance.checkInDate).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    }
    return result;
  }
}
