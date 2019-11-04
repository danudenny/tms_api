import { EntityManager, getManager } from 'typeorm';

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
    WebAwbDeliverSyncPayloadVm, WebDeliveryVm,
} from '../../models/web-awb-deliver.vm';
import { AwbService } from '../v1/awb.service';
import moment = require('moment');

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
  ): Promise<any> {
    const authMeta = AuthService.getAuthData();

    await getManager().transaction(async transactionEntityManager => {
      for (const delivery of payload.deliveries) {
        // set data deliver
        delivery.employeeId = authMeta.employeeId;
        await this.syncDeliver(transactionEntityManager, delivery);
      }
    });

    // TODO: queue by Bull need refactoring
    for (const deliverDetail of payload.deliveries) {
      DoPodDetailPostMetaQueueService.createJobByMobileSyncAwb(
        deliverDetail.doPodDeliverDetailId,
        deliverDetail.employeeId,
        deliverDetail.awbStatusId,
      );
    }

    return null;
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

    if (awbStatus.isProblem) {
      await transactionEntitymanager.increment(
        DoPodDeliver,
        { doPodDeliverId: delivery.doPodDeliverId },
        'totalProblem',
        1,
      );
    } else if (awbStatus.isFinalStatus) {
      await transactionEntitymanager.increment(
        DoPodDeliver,
        { doPodDeliverId: delivery.doPodDeliverId },
        'totalDelivery',
        1,
      );
    }

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

    // Update status awb item attr
    await DeliveryService.updateAwbAttr(
      delivery.awbItemId,
      null,
      doPodDeliverHistory.awbStatusId,
    );
  }
}
