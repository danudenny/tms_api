import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import { MobileCheckInPayloadVm } from '../../models/mobile-check-in-payload.vm';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { EmployeeJourneyRepository } from '../../../../shared/orm-repository/employee-journey.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { IsNull} from 'typeorm';

@Injectable()
export class MobileCheckInService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(EmployeeJourneyRepository)
    private readonly employeeJourneyRepository: EmployeeJourneyRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
  ) {}

  async checkIn(payload: MobileCheckInPayloadVm): Promise<MobileCheckInResponseVm> {
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

      const employeeJourneyCheckOutExist = await this.employeeJourneyRepository.findOne({
        where: {
          employeeId: authMeta.employeeId,
          checkOutDate: IsNull(),
        },
        order: {
          checkInDate: 'DESC',
        },
      });
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
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

  }
}
