import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import {
  IsNull,
  createQueryBuilder,
  MoreThan,
  LessThan,
  Between,
} from 'typeorm';

import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { EmployeeJourneyRepository } from '../../../../shared/orm-repository/employee-journey.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import {
  MobileCheckInPayloadVm,
  MobileCheckInFormPayloadVm,
} from '../../models/mobile-check-in-payload.vm';
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
    let userToBranchId = '';
    let now = moment();
    const timeNow = moment().toDate();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // NOTE: configure dateFrom and dateTo
    // 1. if time now LOWER THAN 06:00 o'clock, dateFrom = 06:00 yesterday and dateTo = 06:00 today
    // 2. else if time now GREATER THAN EQUAL to 06:00 o'clock, dateFrom = 06:00 today and dateTo = 06:00 tomorrow

    // Choose condition 1
    let fromDate = now.subtract(1, 'days').format('YYYY-MM-DD 06:00:00');
    let toDate = now.format('YYYY-MM-DD 06:00:00');
    if (moment().isSameOrAfter(moment().format('YYYY-MM-DD 06:00:00'))) {
      // choose condition 2
      fromDate = moment().format('YYYY-MM-DD 06:00:00');
      toDate = moment()
        .add(1, 'days')
        .format('YYYY-MM-DD 06:00:00');
    }
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
    const branchIdTemp = payload.branchId
      ? payload.branchId
      : permissonPayload.branchId.toString();
    const branch = await this.branchRepository.findOne({
      select: [`branchName`, `branchId`, `updatedTime`],
      where: { branchId: branchIdTemp },
    });
    branchName = branch.branchName;

    if (employeeJourneyCheckOutExist) {
      result.status = 'error';
      result.message = 'Check In sedang aktif, Harap Check Out terlebih dahulu';
      result.checkInDate = moment(
        employeeJourneyCheckOutExist.checkInDate,
      ).format('YYYY-MM-DD HH:mm:ss');
      result.attachmentId = attachmentId;
      result.checkinIdBranch = branch.branchId
        ? branch.branchId.toString()
        : payload.branchId;
      return result;
    } else {
      let res = null;
      if (payload.branchId) {
        // Check coordinate user to branch
        const responseCheckBranch = await MobileKorwilService.validateBranchByCoordinate(
          payload.latitudeCheckIn,
          payload.longitudeCheckIn,
          payload.branchId,
        );
        if (responseCheckBranch.status == false) {
          result.status = 'error';
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
        qb.andWhere('utb.ref_branch_id = :branchIdTemp', {
          branchIdTemp: payload.branchId,
        });
        qb.andWhere('utb.ref_user_id = :idUserLogin', {
          idUserLogin: authMeta.userId,
        });
        res = await qb.getRawOne();
        if (!res) {
          result.status = 'error';
          result.message =
            'Lokasi gerai tidak ditemukan, silahkan hubungi administrator';
          result.branchName = branchName;
          result.checkInDate = checkInDate;
          result.attachmentId = attachmentId;
          result.checkinIdBranch = null;
          return result;
        }
        userToBranchId = res.userToBranchId;
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

      const branchIdCheckIn = payload.branchId
        ? Number(payload.branchId)
        : permissonPayload.branchId;
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
        branchIdCheckIn,
      });
      await this.employeeJourneyRepository.save(employeeJourney);
      const employeeJourneyId = employeeJourney.employeeJourneyId;

      // Create Korwil Detail Item if branchId exists
      if (payload.branchId) {
        const qb = createQueryBuilder();
        // GET task item
        qb.addSelect('ki.korwil_item_id', 'korwilItemId');
        qb.from('korwil_item', 'ki');
        qb.where('ki.is_deleted = false');
        qb.where('ki.role_id = :roleId', { roleId: permission.roleId });

        const korwilItem = await qb.getRawMany();
        let isCreateKorwilDetail = false;

        // Find Korwil Transaction user role where employee journey id is null
        let korwilTransactionUser = await KorwilTransaction.findOne({
          where: {
            isDeleted: false,
            branchId: payload.branchId,
            userId: authMeta.userId,
            employeeJourneyId: IsNull(),
            createdTime: Between(fromDate, toDate),
          },
        });
        if (korwilTransactionUser) {
          isCreateKorwilDetail = true;

          // Update korwil employee id and total task
          korwilTransactionUser.totalTask = korwilItem.length;
          korwilTransactionUser.employeeJourneyId = employeeJourneyId;
          await KorwilTransaction.save(korwilTransactionUser);
        } else {
          korwilTransactionUser = await KorwilTransaction.findOne({
            where: {
              isDeleted: false,
              branchId: payload.branchId,
              userId: authMeta.userId,
              createdTime: Between(fromDate, toDate),
            },
          });
          if (!korwilTransactionUser) {
            isCreateKorwilDetail = true;

            // Insert Korwil Transaction
            korwilTransactionUser = KorwilTransaction.create();
            korwilTransactionUser.branchId = payload.branchId;
            korwilTransactionUser.createdTime = timeNow;
            korwilTransactionUser.date = timeNow;
            korwilTransactionUser.employeeJourneyId =
              employeeJourney.employeeJourneyId;
            korwilTransactionUser.isDeleted = false;
            korwilTransactionUser.status = 0;
            korwilTransactionUser.totalTask = korwilItem.length;
            korwilTransactionUser.updatedTime = timeNow;
            korwilTransactionUser.userId = authMeta.userId;
            korwilTransactionUser.userIdCreated = authMeta.userId;
            korwilTransactionUser.userIdUpdated = authMeta.userId;
            korwilTransactionUser.userToBranchId = userToBranchId;
            await KorwilTransaction.save(korwilTransactionUser);
          } else {
            // update korwil transaction
            korwilTransactionUser.employeeJourneyId = employeeJourneyId;
            await KorwilTransaction.save(korwilTransactionUser);
          }
        }

        if (isCreateKorwilDetail) {
          // Create Korwil Item
          korwilItem.forEach(async item => {
            const korwilTransactionDetail = KorwilTransactionDetail.create();
            korwilTransactionDetail.korwilItemId = item.korwilItemId;
            korwilTransactionDetail.korwilTransactionId =
              korwilTransactionUser.korwilTransactionId;
            korwilTransactionDetail.latChecklist = '';
            korwilTransactionDetail.longChecklist = '';
            korwilTransactionDetail.note = '';
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
