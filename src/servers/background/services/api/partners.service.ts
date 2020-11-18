// #region import
import { createQueryBuilder } from 'typeorm';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { Partner } from '../../../../shared/orm-entity/partner';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { IPartnerPickupRequest } from '../../interfaces/partner-pickup-request.interface';
import {
    CancelDeliverFailedResponseVm, CancelDeliverOkResponseVm, CancelDeliverPayloadVm,
} from '../../models/partner/cancel-dlv.vm';
import { PickupRequest } from '../../../../shared/orm-entity/pickup-request';
import { RedisService } from '../../../../shared/services/redis.service';
// #endregion import

export class ApiPartnersService {
  static async cancelDelivery(
    payload: CancelDeliverPayloadVm,
  ): Promise<CancelDeliverOkResponseVm> {
    const resultOk = new CancelDeliverOkResponseVm();
    const resultFailed = new CancelDeliverFailedResponseVm();
    // init
    resultFailed.status = 'failed';
    resultFailed.awb_number = payload.awb_number;
    resultOk.status = 'success';
    resultOk.awb_number = payload.awb_number;

    const redlock = await RedisService.redlock(`redlock:partner:cancelDelivery:${payload.awb_number}`);
    if (!redlock) {
      resultFailed.message = `awb_number: ${
        payload.awb_number
      } already delivery progress.`;
      throw new BadRequestException(resultFailed);
    }

    // check valid partner
    const partner = await Partner.findOne(
      {
        apiKey: payload.auth_key,
        isActive: true,
      },
      { cache: true },
    );
    if (partner) {
      const pickreq = await this.pickReq(payload.awb_number, Number(partner.partner_id));
      if (pickreq) {
        if (this.validData(pickreq) === true) {

          const statusCancelDelivery = 180;
          if (pickreq.pickupRequestStatusId != statusCancelDelivery) {
            resultOk.message = `awb_number: ${
              payload.awb_number
            } cancel delivery success.`;

            // process cancel delivery
            await this.processCancel(pickreq, partner.partnerName, statusCancelDelivery);
            return resultOk;
          } else {
            resultFailed.message = `awb_number: ${
              payload.awb_number
            } already delivery progress.`;
            throw new BadRequestException(resultFailed);
          }
        } else {
          // notice awb not process cancel
          resultFailed.message = `awb_number: ${
            payload.awb_number
          } already delivery progress.`;
          throw new BadRequestException(resultFailed);
        }
      } else {
        resultFailed.message = `awb_number: ${
          payload.awb_number
        } not found.`;
        throw new BadRequestException(resultFailed);
      }
    } else {
      throw new BadRequestException('Partner Not Found!');
    }
  }

  private static validData(pickreq: IPartnerPickupRequest) {
    // array not valid status
    const notValidStatus = [
      AWB_STATUS.ANT,
      AWB_STATUS.DLV,
      AWB_STATUS.BROKE,
      AWB_STATUS.RTS,
    ];
    if (
      !notValidStatus.includes(Number(pickreq.awbStatusIdLast))
    ) {
      // process cancel
      return true;
    } else {
      return false;
    }
  }

  private static async processCancel(
    pickreq: IPartnerPickupRequest,
    partnerName: string,
    statusCancelDelivery: number,
  ): Promise<boolean> {
    // update partner_request cancel deliver by partner
    try {
      // update status pickup request to 180 (Cancel Delivery)
      await PickupRequest.update(
        {
          pickupRequestId: pickreq.pickupRequestId,
        },
        {
          pickupRequestStatusId: statusCancelDelivery,
          pickupRequestStatusIdLast: statusCancelDelivery,
          updatedTime: new Date(),
          userIdUpdated: 1, // admin
        },
      );
      // send data to bull process background
      // TODO: to be confirmed awb status cancel
      const awbStatusCancel = 1800; // new 1850 -- cancel partner
      DoPodDetailPostMetaQueueService.createJobByCancelDeliver(
        pickreq.awbItemId,
        awbStatusCancel,
        pickreq.branchIdLast,
        partnerName,
      );
      return true;
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  private static async pickReq(
    awbNumber: string,
    partnerId: number,
  ): Promise<IPartnerPickupRequest> {
    const qb = createQueryBuilder();
    qb.addSelect('t1.pickup_request_id', 'pickupRequestId');
    qb.addSelect('t1.ref_awb_number', 'awbNumber');
    qb.addSelect('t1.awb_item_id', 'awbItemId');
    qb.addSelect('t3.awb_status_id_last', 'awbStatusIdLast');
    qb.addSelect('t3.awb_status_id_final', 'awbStatusIdFinal');
    qb.addSelect('t3.branch_id_last', 'branchIdLast');
    qb.addSelect('t2.pickup_request_status_id', 'pickupRequestStatusId');

    qb.from('pickup_request_detail', 't1');
    qb.innerJoin(
      'pickup_request',
      't2',
      't1.pickup_request_id = t2.pickup_request_id AND t2.is_deleted = false',
    );
    qb.innerJoin(
      'awb_item_attr',
      't3',
      't3.awb_item_id = t1.awb_item_id AND t3.is_deleted = false',
    );
    qb.where('t2.partner_id = :partnerId', { partnerId });
    qb.andWhere('t1.ref_awb_number = :awbNumber', { awbNumber });
    qb.andWhere('t1.is_deleted = false');

    return await qb.getRawOne();
  }
}
