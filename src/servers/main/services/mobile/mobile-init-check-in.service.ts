import moment = require('moment');
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, IsNull } from 'typeorm';

import { AuthService } from '../../../../shared/services/auth.service';
import { EmployeeJourney } from '../../../../shared/orm-entity/employee-journey';
import { MobileCheckInResponseVm, MobileInitCheckInResponseVm } from '../../models/mobile-check-in-response.vm';



export class MobileInitCheckInService {
  constructor(){}

  public static async getInitCheckInByRequest(): Promise<MobileInitCheckInResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileInitCheckInResponseVm();

    result.checkIn = await this.getStatusCheckIn(authMeta.employeeId);

    return result;
  }

  private static async getStatusCheckIn(
    employeeId: number,
  ): Promise<MobileCheckInResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result: MobileCheckInResponseVm = {
      status: '',
      message: 'Belum check in',
      branchName: '',
      checkInDate: '',
      attachmentId: null,
      isCheckIn: false,
      checkinIdBranch: "",
    };

    const employeeJourneyCheck = await EmployeeJourney.findOne(
      {
        where: {
          employeeId,
          checkOutDate: IsNull(),
        },
        order: {
          checkInDate: 'DESC',
        },
      },
    );
    if (employeeJourneyCheck) {
      result.status = '';
      result.isCheckIn = true;
      result.message =
        'Check In sedang aktif';
      result.checkInDate = moment(employeeJourneyCheck.checkInDate)
        .format('YYYY-MM-DD HH:mm:ss');

      const employeeJourney = await EmployeeJourney.findOne({
        where: {
          employeeId: authMeta.employeeId,
          checkOutDate: IsNull(),
        },
        order: {
          checkInDate: 'DESC',
        },
      });
      if (employeeJourney) {
        const qb = createQueryBuilder();
        qb.addSelect('kt.branch_id', 'checkinIdBranch');
        qb.from('korwil_transaction', 'kt');
        qb.where('kt.is_deleted = false');
        qb.andWhere('kt.user_id = :userId', { userId: authMeta.userId })
        qb.andWhere('kt.employee_journey_id = :employeeJourneyId', { employeeJourneyId: employeeJourney.employeeJourneyId })
        qb.orderBy('created_time', 'DESC');

        const res = await qb.getRawOne();

        // get last check in transaction branch
        if(res){
          result.checkinIdBranch = res.checkinIdBranch;
        }
      }
    }

    return result;
  }
}
