import moment = require('moment');
import { EntityManager, getManager } from 'typeorm';

import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverHistory } from '../../../../shared/orm-entity/do-pod-deliver-history';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { MobileDeliveryVm } from '../../models/mobile-delivery.vm';
import { MobileSyncPayloadVm } from '../../models/mobile-sync-payload.vm';
import { MobileInitDataService } from './mobile-init-data.service';

export class MobileSyncService {
  public static async syncByRequest(payload: MobileSyncPayloadVm) {
    await getManager().transaction(async transactionEntityManager => {
      for (const delivery of payload.deliveries) {
        await this.syncDeliver(transactionEntityManager, delivery);
      }
    });

    // NOTE: queue by Bull
    for (const deliverDetail of payload.deliveries) {
      DoPodDetailPostMetaQueueService.createJobByMobileSyncAwb(
        deliverDetail.doPodDeliverDetailId,
        deliverDetail.awbStatusId,
      );
    }
    return MobileInitDataService.getInitDataByRequest(payload.lastSyncDateTime);
  }

  public static async syncDeliver(
    transactionEntitymanager: EntityManager,
    delivery: MobileDeliveryVm,
  ) {
    const doPodDeliverHistories: DoPodDeliverHistory[] = [];

    for (const deliveryHistory of delivery.deliveryHistory) {
      if (!deliveryHistory.doPodDeliverHistoryId) {
        const doPodDeliverHistory = DoPodDeliverHistory.create({
          doPodDeliverDetailId: delivery.doPodDeliverDetailId,
          awbStatusId: deliveryHistory.awbStatusId,
          reasonId: deliveryHistory.reasonId,
          syncDateTime: new Date(),
          latitudeDelivery: deliveryHistory.latitudeDelivery,
          longitudeDelivery: deliveryHistory.longitudeDelivery,
          desc: deliveryHistory.reasonNotes,
          awbStatusDateTime: moment(deliveryHistory.historyDateTime).toDate(),
          historyDateTime: moment(deliveryHistory.historyDateTime).toDate(),
          employeeIdDriver: deliveryHistory.employeeId,
        });
        doPodDeliverHistories.push(doPodDeliverHistory);
      }
    }

    if (doPodDeliverHistories.length) {
      await transactionEntitymanager.insert(
        DoPodDeliverHistory,
        doPodDeliverHistories,
      );

      const lastDoPodDeliverHistory =
        doPodDeliverHistories[doPodDeliverHistories.length - 1];
      await transactionEntitymanager.update(
        DoPodDeliverDetail,
        delivery.doPodDeliverDetailId,
        {
          awbStatusIdLast: lastDoPodDeliverHistory.awbStatusId,
          latitudeDeliveryLast: lastDoPodDeliverHistory.latitudeDelivery,
          longitudeDeliveryLast: lastDoPodDeliverHistory.longitudeDelivery,
          awbStatusDateTimeLast: lastDoPodDeliverHistory.awbStatusDateTime,
          reasonIdLast: lastDoPodDeliverHistory.reasonId,
          syncDateTimeLast: lastDoPodDeliverHistory.syncDateTime,
          descLast: lastDoPodDeliverHistory.desc,
          updatedTime: new Date(),
        },
      );

      await DeliveryService.updateAwbAttr(
        delivery.awbItemId,
        null,
        lastDoPodDeliverHistory.awbStatusId,
      );
    }
  }
}
