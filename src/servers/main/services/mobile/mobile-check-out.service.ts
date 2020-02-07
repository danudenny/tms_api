import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { IsNull, createQueryBuilder } from 'typeorm';

import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { EmployeeJourneyRepository } from '../../../../shared/orm-repository/employee-journey.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { MobileCheckOutPayloadVm } from '../../models/mobile-check-out-payload.vm';
import { MobileCheckOutResponseVm } from '../../models/mobile-check-out-response.vm';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { MobileKorwilService } from './mobile-korwil.service';
import { error } from 'winston';

@Injectable()
export class MobileCheckOutService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(EmployeeJourneyRepository)
    private readonly employeeJourneyRepository: EmployeeJourneyRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
  ) {}

  // TODO: unused method
  async checkOut(
    payload: MobileCheckOutPayloadVm,
  ): Promise<MobileCheckOutResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileCheckOutResponseVm();
      let status = 'ok';
      let message = 'success';
      let branchName = '';
      let checkOutDate = '';

      const timeNow = moment().toDate();

      // console.log(payload);
      const permissonPayload = AuthService.getPermissionTokenPayload();

      const employeeJourney = await this.employeeJourneyRepository.findOne({
        where: {
          employeeId: authMeta.employeeId,
          checkOutDate: IsNull(),
        },
        order: {
          checkInDate: 'DESC',
        },
      });
      if (employeeJourney) {
        employeeJourney.checkOutDate = timeNow;
        employeeJourney.userIdUpdated = authMeta.userId;
        employeeJourney.updatedTime = timeNow;
        employeeJourney.latitudeCheckOut = payload.latitudeCheckOut;
        employeeJourney.longitudeCheckOut = payload.longitudeCheckOut;

        await this.employeeJourneyRepository.save(employeeJourney);

        const branch = await this.branchRepository.findOne({
          select: ['branchName'],
          where: { branchId: permissonPayload.branchId },
        });

        branchName = branch.branchName;
        checkOutDate = moment().format('YYYY-MM-DD HH:mm:ss');
      } else {
        status = 'error';
        message = 'Anda belum melakukan Check In sebelumnya';
      }

      result.status = status;
      result.message = message;
      result.branchName = branchName;
      result.checkOutDate = checkOutDate;
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

  async checkOutForm(
    payload: MobileCheckOutPayloadVm,
    file,
  ): Promise<MobileCheckOutResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileCheckOutResponseVm();
    let status = 'ok';
    let message = 'success';
    let branchName = '';
    let checkOutDate = '';
    let attachmentId = null;

    const timeNow = moment().toDate();

    if(payload.branchId){
      const responseCheckBranch = await MobileKorwilService.validateBranchByCoordinate(payload.latitudeCheckOut, payload.longitudeCheckOut, payload.branchId);
      if (responseCheckBranch.status == false){
        const qb = createQueryBuilder();
        qb.addSelect('utb.user_to_branch_id', 'userToBranchId');
        qb.from('user_to_branch', 'utb');
        qb.where('utb.is_deleted = false');
        qb.andWhere('utb.ref_branch_id = :branchIdTemp', { branchIdTemp: payload.branchId });
        qb.andWhere('utb.ref_user_id = :idUserLogin', { idUserLogin: authMeta.userId });
        const res = await qb.getRawOne();

        if(!res){
          result.status = "error";
          result.message = 'Branch Check In tidak valid!';
          result.branchName = branchName;
          result.checkOutDate = checkOutDate;
          result.attachmentId = attachmentId;
          return result;
        }else{
          message = "Checkout berhasil, Check Out diluar wilayah gerai Check In";
        }
      }
    }

    const permissonPayload = AuthService.getPermissionTokenPayload();
    const employeeJourney = await this.employeeJourneyRepository.findOne({
      where: {
        employeeId: authMeta.employeeId,
        checkOutDate: IsNull(),
      },
      order: {
        checkInDate: 'DESC',
      },
    });
    if (employeeJourney) {
      // upload image
      const attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        'tms-check-out',
      );
      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
      }

      employeeJourney.checkOutDate = timeNow;
      employeeJourney.userIdUpdated = authMeta.userId;
      employeeJourney.updatedTime = timeNow;
      employeeJourney.latitudeCheckOut = payload.latitudeCheckOut;
      employeeJourney.longitudeCheckOut = payload.longitudeCheckOut;
      employeeJourney.attachmentIdCheckOut = attachmentId;

      await this.employeeJourneyRepository.save(employeeJourney);

      const branch = await this.branchRepository.findOne({
        select: ['branchName'],
        where: { branchId: payload.branchId ? payload.branchId : permissonPayload.branchId },
      });

      branchName = branch.branchName;
      checkOutDate = moment().format('YYYY-MM-DD HH:mm:ss');
    } else {
      status = 'error';
      message = 'Anda belum melakukan Check In sebelumnya';
    }

    result.status = status;
    result.message = message;
    result.branchName = branchName;
    result.checkOutDate = checkOutDate;
    result.attachmentId = attachmentId;
    return result;
  }
}
