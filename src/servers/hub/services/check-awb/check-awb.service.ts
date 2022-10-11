import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import moment = require('moment');

import { AwbCheckLog } from '../../../../shared/orm-entity/awb-check-log';
import { AwbCheckSummary } from '../../../../shared/orm-entity/awb-check-summary';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfigService } from '../../../../shared/services/config.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { HubCheckAwbQueueService } from '../../../queue/services/hub-check-awb-queue.service';
import { CheckAwbService } from '../../interfaces/check-awb.interface';
import {
  SORTATION_SERVICE,
  SortationService,
} from '../../interfaces/sortation-service.interface';
import { CheckAwbPayload } from '../../models/check-awb/check-awb.payload';
import {
  CheckAwbResponse,
  StartCheckAwbResponse,
} from '../../models/check-awb/check-awb.response';

@Injectable()
export class DefaultCheckAwbService implements CheckAwbService {
  constructor(
    @Inject(SORTATION_SERVICE)
    private readonly sortationService: SortationService,
  ) {}

  async startSession(): Promise<StartCheckAwbResponse> {
    const session = await this.createSummary();
    return {
      status: HttpStatus.CREATED,
      message: 'Success',
      data: {
        awbCheckId: session.id,
      },
    } as StartCheckAwbResponse;
  }

  async getAwb(payload: CheckAwbPayload): Promise<CheckAwbResponse> {
    const authMeta = AuthService.getAuthMetadata();
    const perm = AuthService.getPermissionTokenPayload();
    const awb = await this.sortationService.getAwb(payload.awbNumber);
    const response: CheckAwbResponse = {
      status: HttpStatus.OK,
      message: 'Success get AWB',
      data: {
        awbCheckId: payload.awbCheckId,
        awbNumber: payload.awbNumber,
        destination: awb.destination,
        transportType: awb.transport_type,
      },
    };

    // check duplicate awb scan in current branch
    const q = new OrionRepositoryService(AwbCheckLog, 'acl').findOne();
    const duplicate = await q
      .select({
        id: true,
      })
      .innerJoinRaw(
        'awb_check_summary',
        'acs',
        `acs.branch_id = :branchId AND acs.is_deleted = FALSE`,
        { branchId: perm.branchId },
      )
      .andWhereRaw('awb_number = :awb', { awb: payload.awbNumber })
      .andWhereRaw('acl.is_deleted = FALSE');

    if (duplicate) {
      return response;
    }

    // check last updated/ end time of current session
    const session = await AwbCheckSummary.findOne(
      { id: payload.awbCheckId, isDeleted: false },
      { select: ['endTime'] },
    );
    let timeDifference = 0;
    const now = moment();
    if (session) {
      timeDifference = moment
        .duration(now.diff(moment(session.endTime)))
        .asMilliseconds();
    }
    const maxIdleTime = ConfigService.get('hubCheckAwb.maxIdleTimeInMinutes');
    if (!session || timeDifference > maxIdleTime * 60000) {
      const summary = await this.createSummary();
      response.data.awbCheckId = summary.id;
    }

    await HubCheckAwbQueueService.addJob({
      userId: authMeta.userId,
      awbCheckId: payload.awbCheckId,
      awbNumber: payload.awbNumber,
      time: now.toDate(),
    });

    return response;
  }

  private async createSummary(): Promise<AwbCheckSummary> {
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
      isDeleted: false,
    });
    return AwbCheckSummary.save(awbCheck);
  }
}
