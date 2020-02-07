import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { IsNull } from 'typeorm';

import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { EmployeeJourneyRepository } from '../../../../shared/orm-repository/employee-journey.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { MobileCheckInPayloadVm, MobileCheckInFormPayloadVm } from '../../models/mobile-check-in-payload.vm';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';

@Injectable()
export class MobileCheckInService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(EmployeeJourneyRepository)
    private readonly employeeJourneyRepository: EmployeeJourneyRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
  ) {}

  // TODO: unused method
  async checkIn(
    payload: MobileCheckInPayloadVm,
  ): Promise<MobileCheckInResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileCheckInResponseVm();
      let status = 'ok';
      let message = 'success';
      let branchName = '';
      let checkInDate = '';

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
        const employeeJourney = this.employeeJourneyRepository.create({
          employeeId: authMeta.employeeId,
          checkInDate: timeNow,
          latitudeCheckIn: payload.latitudeCheckIn,
          longitudeCheckIn: payload.longitudeCheckIn,
          userIdCreated: authMeta.userId,
          createdTime: timeNow,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
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
      result.branchName = branchName;
      result.checkInDate = checkInDate;
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

  async checkInForm(
    payload: MobileCheckInFormPayloadVm,
    file,
  ): Promise<MobileCheckInResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileCheckInResponseVm();
    let status = 'ok';
    let message = 'success';
    let branchName = '';
    let checkInDate = '';
    let attachmentId = null;

    const timeNow = moment().toDate();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
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
        'tms-check-in',
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

      // insert pending status korwil
      const korwilTransaction = KorwilTransaction.create();
      korwilTransaction.date = timeNow;
      korwilTransaction.branchId = payload.branchId;
      korwilTransaction.userId = authMeta.userId;
      korwilTransaction.status = 0;
      korwilTransaction.createdTime = timeNow;
      korwilTransaction.isDeleted = false;
      await KorwilTransaction.save(korwilTransaction);

      const branch = await this.branchRepository.findOne({
        select: ['branchName'],
        where: { branchId: payload.branchId },
      });
      branchName = branch.branchName;
      checkInDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    result.status = status;
    result.message = message;
    result.branchName = branchName;
    result.checkInDate = checkInDate;
    result.attachmentId = attachmentId;
    return result;
  }
}
