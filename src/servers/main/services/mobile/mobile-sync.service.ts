import moment = require('moment');

import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverHistory } from '../../../../shared/orm-entity/do-pod-deliver-history';
import { MobileDeliveryVm } from '../../models/mobile-delivery.vm';
import { MobileSyncPayloadVm } from '../../models/mobile-sync-payload.vm';
import { MobileInitDataService } from './mobile-init-data.service';

export class MobileSyncService {
  public static async syncByRequest(payload: MobileSyncPayloadVm) {
    for (const delivery of payload.deliveries) {
      await this.syncDeliver(delivery);
    }

    return MobileInitDataService.getInitDataByRequest(payload.lastSyncDateTime);
  }

  public static async syncDeliver(delivery: MobileDeliveryVm) {
    // 2019-07-27 14:22:04 Labib *** do not bulk insert here, every history must be inserted one by one
    const doPodDeliverHistories: DoPodDeliverHistory[] = [];
    for (const deliveryHistory of delivery.deliveryHistory) {
      if (!deliveryHistory.doPodDeliverHistoryId) {
        const doPodDeliverHistory = DoPodDeliverHistory.create({
          doPodDeliverDetailId: delivery.doPodDeliverDetailId,
          awbStatusDateTime: moment(deliveryHistory.historyDateTime).toDate(),
          awbStatusId: deliveryHistory.awbStatusId,
          reasonId: deliveryHistory.reasonId,
          syncDateTime: new Date(),
          latitudeDelivery: deliveryHistory.latitudeDelivery,
          longitudeDelivery: deliveryHistory.longitudeDelivery,
          desc: deliveryHistory.reasonNotes,
        });
        await DoPodDeliverHistory.insert(doPodDeliverHistory);

        // TODO: post each history to awb_history and awb_summary

        doPodDeliverHistories.push(doPodDeliverHistory);
      }
    }

    const lastDoPodDeliverHistory = doPodDeliverHistories[doPodDeliverHistories.length - 1];
    await DoPodDeliverDetail.update(delivery.doPodDeliverId, {
      awbStatusIdLast: lastDoPodDeliverHistory.awbStatusId,
      latitudeDeliveryLast: lastDoPodDeliverHistory.latitudeDelivery,
      longitudeDeliveryLast: lastDoPodDeliverHistory.longitudeDelivery,
      awbStatusDateTimeLast: lastDoPodDeliverHistory.awbStatusDateTime,
      reasonIdLast: lastDoPodDeliverHistory.reasonId,
      syncDateTimeLast: lastDoPodDeliverHistory.syncDateTime,
      desc_last: lastDoPodDeliverHistory.desc,
    });
  }
}
