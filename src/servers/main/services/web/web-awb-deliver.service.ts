import { EntityManager, getManager, LessThan, MoreThan } from 'typeorm';

import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverHistory } from '../../../../shared/orm-entity/do-pod-deliver-history';
import { AuthService } from '../../../../shared/services/auth.service';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    AwbDeliverManualResponseVm, WebAwbDeliverGetPayloadVm, WebAwbDeliverGetResponseVm,
    WebAwbDeliverSyncPayloadVm, WebDeliveryVm, WebAwbDeliverSyncResponseVm,
} from '../../models/web-awb-deliver.vm';
import { AwbService } from '../v1/awb.service';
import moment = require('moment');
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';

export class WebAwbDeliverService {
  constructor() {
  }

  static async getAwbDeliver(
    payload: WebAwbDeliverGetPayloadVm,
  ): Promise<WebAwbDeliverGetResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebAwbDeliverGetResponseVm();
    const data: AwbDeliverManualResponseVm[] = [];

    for (const awbNumber of payload.awbNumber) {
      const awbManual = new AwbDeliverManualResponseVm();
      // NOTE: take out validation user driver
      const awb = await AwbService.getDataDeliver(awbNumber, authMeta.userId);
      if (awb) {
        // TODO: check to table do pod deliver
        awbManual.awb = awb;
        awbManual.awbNumber = awbNumber;
        awbManual.status = 'ok';
        awbManual.message = 'success';
      } else {
        awbManual.awbNumber = awbNumber;
        awbManual.status = 'error';
        awbManual.message = `Resi ${awbNumber} tidak ditemukan`;
      }

      // const awbDeliver = new AwbDeliverManualVm();
      data.push(awbManual);
    } // end of loop

    result.data = data;
    return result;
  }

  static async syncAwbDeliver(
    payload: WebAwbDeliverSyncPayloadVm,
  ): Promise<WebAwbDeliverSyncResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebAwbDeliverSyncResponseVm();
    try {
      await getManager().transaction(async transactionEntityManager => {
        for (const delivery of payload.deliveries) {
          // set data deliver
          delivery.employeeId = authMeta.employeeId;
          await this.syncDeliver(transactionEntityManager, delivery);
        }
      });

      // TODO: queue by Bull need refactoring
      // for (const deliverDetail of payload.deliveries) {
      //   DoPodDetailPostMetaQueueService.createJobByMobileSyncAwb(
      //     deliverDetail.doPodDeliverDetailId,
      //     deliverDetail.employeeId,
      //     deliverDetail.awbStatusId,
      //   );
      // }

      result.status = 'ok';
      result.message = 'success';
    } catch (error) {
      result.status = 'error';
      result.message = `message error ${error.message}`;
    }
    return result;
  }

  private static async syncDeliver(
    transactionEntitymanager: EntityManager,
    delivery: WebDeliveryVm,
  ) {

    // Generate History by Status input pod manual
    const doPodDeliverHistory = DoPodDeliverHistory.create({
      doPodDeliverDetailId: delivery.doPodDeliverDetailId,
      awbStatusId: delivery.awbStatusId,
      reasonId: delivery.reasonId,
      syncDateTime: moment().toDate(),
      desc: delivery.reasonNotes,
      awbStatusDateTime: moment(delivery.doPodDeliverDate).toDate(),
      historyDateTime: moment(delivery.doPodDeliverDate).toDate(),
      employeeIdDriver: delivery.employeeId,
    });

    await transactionEntitymanager.insert(
      DoPodDeliverHistory,
      doPodDeliverHistory,
    );

    const awbStatus = await AwbStatus.findOne(
      doPodDeliverHistory.awbStatusId,
    );

    // TODO: validation check final status last
    const awbdDelivery = await DoPodDeliverDetail.findOne({
      where: {
        doPodDeliverDetailId: delivery.doPodDeliverDetailId,
        isDeleted: false,
      },
    });
    const finalStatus = [AWB_STATUS.DLV, AWB_STATUS.BROKE, AWB_STATUS.RTS];
    if (awbdDelivery && !finalStatus.includes(awbdDelivery.awbStatusIdLast)) {
      // Update data DoPodDeliverDetail
      await transactionEntitymanager.update(
        DoPodDeliverDetail,
        delivery.doPodDeliverDetailId,
        {
          awbStatusIdLast: doPodDeliverHistory.awbStatusId,
          awbStatusDateTimeLast: doPodDeliverHistory.awbStatusDateTime,
          reasonIdLast: doPodDeliverHistory.reasonId,
          syncDateTimeLast: doPodDeliverHistory.syncDateTime,
          descLast: doPodDeliverHistory.desc,
          consigneeName: delivery.consigneeNameNote,
          updatedTime: moment().toDate(),
        },
      );

      // TODO: validation DoPodDeliver
      const doPodDeliver = await DoPodDeliver.findOne({
        where: {
          doPodDeliverId: delivery.doPodDeliverId,
          isDeleted: false,
        },
      });
      if (doPodDeliver) {
        if (awbStatus.isProblem) {
          await transactionEntitymanager.increment(
            DoPodDeliver,
            {
              doPodDeliverId: delivery.doPodDeliverId,
              totalProblem: LessThan(doPodDeliver.totalAwb),
            },
            'totalProblem',
            1,
          );
        } else if (awbStatus.isFinalStatus) {
          await transactionEntitymanager.increment(
            DoPodDeliver,
            {
              doPodDeliverId: delivery.doPodDeliverId,
              totalDelivery: LessThan(doPodDeliver.totalAwb),
            },
            'totalDelivery',
            1,
          );
          // balance total problem
          await transactionEntitymanager.decrement(
            DoPodDeliver,
            {
              doPodDeliverId: delivery.doPodDeliverId,
              totalProblem: MoreThan(0),
            },
            'totalProblem',
            1,
          );
        }
      }

      // Update status awb item attr
      await DeliveryService.updateAwbAttr(
        delivery.awbItemId,
        null,
        doPodDeliverHistory.awbStatusId,
      );

      // TODO: queue by Bull need refactoring
      DoPodDetailPostMetaQueueService.createJobByMobileSyncAwb(
        delivery.doPodDeliverDetailId,
        delivery.employeeId,
        delivery.awbStatusId,
      );
    } else {
      console.log('##### Data Not Valid', delivery);
    }
  }
}
