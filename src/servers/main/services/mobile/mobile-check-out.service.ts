
import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import moment = require('moment');
import { AuthService } from 'src/shared/services/auth.service';
import { EmployeeJourneyRepository } from 'src/shared/orm-repository/employee-journey.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ContextualErrorService } from 'src/shared/services/contextual-error.service';
import { MobileCheckOutPayloadVm } from '../../models/mobile-check-out-payload.vm';
import { MobileCheckOutResponseVm } from '../../models/mobile-check-out-response.vm';
import { BranchRepository } from 'src/shared/orm-repository/branch.repository';
import { isNull } from 'util';
import { IsNull } from 'typeorm';

@Injectable()
export class MobileCheckOutService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(EmployeeJourneyRepository)
    private readonly employeeJourneyRepository: EmployeeJourneyRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
  ) {}

  async checkOut(payload: MobileCheckOutPayloadVm): Promise<MobileCheckOutResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const result = new MobileCheckOutResponseVm();
      let status = 'ok';
      let message = 'success';
      let branchName = '';
      let checkOutDate = '';

      const timeNow = moment().toDate();

      // console.log(payload);
      const permissonPayload = await this.authService.handlePermissionJwtToken(payload.permissionToken);

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
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

  }
}
