import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import { MobileCheckInPayloadVm } from '../../models/mobile-check-in-payload.vm';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import moment = require('moment');
import { AuthService } from 'src/shared/services/auth.service';
import { EmployeeJourneyRepository } from 'src/shared/orm-repository/employee-journey.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ContextualErrorService } from 'src/shared/services/contextual-error.service';
import { BranchRepository } from 'src/shared/orm-repository/branch.repository';

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
      const status = 'ok';
      const message = 'success';
      const checkInDate = moment().format('YYYY-MM-DD HH:mm:ss');

      const timeNow = moment().toDate();

      // console.log(payload);
      const permissonPayload = await this.authService.handlePermissionJwtToken(payload.permissionToken);

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

      result.status = status;
      result.message = message;
      result.branchName = branch.branchName;
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
