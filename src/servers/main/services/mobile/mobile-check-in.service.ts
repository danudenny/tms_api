import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { IsNull, createQueryBuilder, MoreThan, LessThan, Between } from 'typeorm';

import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { EmployeeJourneyRepository } from '../../../../shared/orm-repository/employee-journey.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { MobileCheckInPayloadVm, MobileCheckInFormPayloadVm } from '../../models/mobile-check-in-payload.vm';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { MobileKorwilService } from './mobile-korwil.service';
import { KorwilTransactionDetail } from '../../../../shared/orm-entity/korwil-transaction-detail';
import { ConfigService } from '../../../../shared/services/config.service';

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
    const result = new MobileCheckInResponseVm();
    const configKorwil = ConfigService.get('korwil');
    const authMeta = AuthService.getAuthMetadata();
    const dateNow = moment().toDate();
    const permission = AuthService.getPermissionTokenPayload();
    let status = 'ok';
    let message = 'success';
    let branchName = '';
    let checkInDate = '';
    let attachmentId = null;

    const timeNow = moment().toDate();
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
    let branchIdTemp = payload.branchId ? payload.branchId : permissonPayload.branchId.toString();
    const branch = await this.branchRepository.findOne({
      select: [`branchName`, `branchId`, `updatedTime`],
      where: { branchId: branchIdTemp },
    });
    branchName = branch.branchName;

    if (employeeJourneyCheckOutExist) {
      result.status = "error";
      result.message = 'Check In sedang aktif, Harap Check Out terlebih dahulu';
      result.checkInDate = moment(employeeJourneyCheckOutExist.checkInDate).format('YYYY-MM-DD HH:mm:ss');
      result.attachmentId = attachmentId;
      result.checkinIdBranch = branch.branchId ? branch.branchId.toString() : payload.branchId;
      return result;
    } else {
      let res = null;
      if(payload.branchId){
        // Check coordinate user to branch
        const responseCheckBranch = await MobileKorwilService.validateBranchByCoordinate(payload.latitudeCheckIn, payload.longitudeCheckIn, payload.branchId);
        if (responseCheckBranch.status == false){
          result.status = "error";
          result.message = responseCheckBranch.message;
          result.branchName = branchName;
          result.checkInDate = checkInDate;
          result.attachmentId = attachmentId;
          result.checkinIdBranch = null;
          return result;
        }

        // Check existing branch korwil user
        const qb = createQueryBuilder();
        qb.addSelect('utb.user_to_branch_id', 'userToBranchId');
        qb.from('user_to_branch', 'utb');
        qb.where('utb.is_deleted = false');
        qb.andWhere('utb.ref_branch_id = :branchIdTemp', { branchIdTemp: payload.branchId });
        qb.andWhere('utb.ref_user_id = :idUserLogin', { idUserLogin: authMeta.userId });
        res = await qb.getRawOne();
        if(!res){
          result.status = "error";
          result.message = 'Branch Check In tidak valid';
          result.branchName = branchName;
          result.checkInDate = checkInDate;
          result.attachmentId = attachmentId;
          result.checkinIdBranch = null;
          return result;
        }
      }

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

      // Create Employee Journey
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
        branchIdCheckIn: Number(payload.branchId),
      });
      await this.employeeJourneyRepository.save(employeeJourney);
      const employeeJourneyId = employeeJourney.employeeJourneyId;


      // Create Korwil Detail Item if branchId exists
      if(payload.branchId){
        // Find Korwil Transaction user role where employee journey id is null
        let korwilTransactionUser = await KorwilTransaction.findOne({
          where: {
            isDeleted: false,
            branchId: payload.branchId,
            userId: authMeta.userId,
            // status: 0,
            roleId: permission.roleId,
            employeeJourneyId: IsNull()
            // createdTime: Between(moment().format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')),
          },
        });

        if(korwilTransactionUser){
          const qb = createQueryBuilder();
          const fromDate = moment().format('YYYY-MM-DD 00:00:00');
          const toDate = moment().format('YYYY-MM-DD 23:59:59');

          // GET task item
          qb.addSelect('ki.korwil_item_id', 'korwilItemId');
          qb.from('korwil_item', 'ki');
          qb.where('ki.is_deleted = false');
          if(configKorwil.korwilRoleId != permission.roleId){
            qb.where('ki.role_id = :roleId',{roleId: configKorwil.korwilRoleId});
          }
          const korwilItem = await qb.getRawMany();

          // GET transaction korwil, created from cron
          let korwilTransaction = await KorwilTransaction.findOne({
            where: {
              branchId: payload.branchId,
              userId: authMeta.userId,
              createdTime: Between(fromDate, toDate),
            },
          });

          if(!korwilTransaction){
            result.message = "Korwil Transaction tidak ditemukan";
            result.status = "error";
            return result;
          }

          // Update korwil employee id and total task
          korwilTransaction.totalTask = korwilItem.length;
          korwilTransaction.employeeJourneyId = employeeJourneyId;
          await KorwilTransaction.save(korwilTransaction);

          // Create Korwil Item
          res.forEach(async(item) => {
            const korwilTransactionDetail = KorwilTransactionDetail.create();
            korwilTransactionDetail.korwilItemId = item.korwilItemId;
            korwilTransactionDetail.korwilTransactionId = korwilTransaction.korwilTransactionId;
            korwilTransactionDetail.latChecklist = "";
            korwilTransactionDetail.longChecklist = "";
            korwilTransactionDetail.note = "";
            korwilTransactionDetail.status = 0;
            korwilTransactionDetail.isDone = false;
            korwilTransactionDetail.date = dateNow;
            korwilTransactionDetail.photoCount = 0;
            korwilTransactionDetail.userIdCreated = authMeta.userId;
            korwilTransactionDetail.createdTime = dateNow;
            korwilTransactionDetail.updatedTime = dateNow;
            korwilTransactionDetail.userIdUpdated = authMeta.userId;
            await KorwilTransactionDetail.save(korwilTransactionDetail);
          });
        }
      }
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
