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
        qb.addSelect('b.branch_name', 'branchName');
        qb.from('branch', 'b');
        qb.where('b.is_deleted = false');
        qb.andWhere('b.branch_id = :branchIdTemp', { branchIdTemp: employeeJourney.branchIdCheckIn })

        const res = await qb.getRawOne();
        // get last check in transaction branch
        if(res){
          result.checkinIdBranch = employeeJourney.branchIdCheckIn.toString();
          result.branchName = res.branchName;
        }
      }
    }

    return result;
  }
}
