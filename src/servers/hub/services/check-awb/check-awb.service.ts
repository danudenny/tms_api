import { HttpStatus } from '@nestjs/common';
import moment = require('moment');

import { AwbCheckSummary } from '../../../../shared/orm-entity/awb-check-summary';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckAwbService } from '../../interfaces/check-awb.interface';
import { CheckAwbPayload } from '../../models/check-awb/check-awb.payload';
import {
  CheckAwbResponse,
  StartCheckAwbResponse,
} from '../../models/check-awb/check-awb.response';

export class DefaultCheckAwbService implements CheckAwbService {
  async startSession(): Promise<StartCheckAwbResponse> {
    const authMeta = AuthService.getAuthMetadata();
    const perm = AuthService.getPermissionTokenPayload();
    const now = moment().toDate();
    const awbCheck = await AwbCheckSummary.create({
      startTime: now,
      endTime: now,
      branchId: perm.branchId,
      userIdCreated: authMeta.userId,
      userIdUpdated: authMeta.userId,
      createdTime: now,
      updatedTime: now,
    });
    const newAwbCheck = await AwbCheckSummary.save(awbCheck);
    return {
      status: HttpStatus.CREATED,
      message: 'Success',
      data: {
        awbCheckId: newAwbCheck.id,
      },
    } as StartCheckAwbResponse;
  }

  getAwb: (payload: CheckAwbPayload) => Promise<CheckAwbResponse>;
}
