import { last } from 'lodash';
import { EntityManager, getManager, LessThan, MoreThan } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AttachmentTms } from '../../../../shared/orm-entity/attachment-tms';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverHistory } from '../../../../shared/orm-entity/do-pod-deliver-history';
import { DoPodDeliverAttachment } from '../../../../shared/orm-entity/do_pod_deliver_attachment';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { MobileDeliveryVm } from '../../models/mobile-delivery.vm';
import { MobileSyncImagePayloadVm, MobileSyncPayloadVm } from '../../models/mobile-sync-payload.vm';
import { MobileSyncImageResponseVm } from '../../models/mobile-sync-response.vm';
import { MobileInitDataService } from './mobile-init-data.service';
import moment = require('moment');

export class MobileSyncService {
  public static async syncByRequest(payload: MobileSyncPayloadVm) {
    await getManager().transaction(async transactionEntityManager => {
      for (const delivery of payload.deliveries) {
        await this.syncDeliver(transactionEntityManager, delivery);
      }
    });

    // // TODO: queue by Bull need refactoring
    // for (const deliverDetail of payload.deliveries) {
    //   DoPodDetailPostMetaQueueService.createJobByMobileSyncAwb(
    //     deliverDetail.doPodDeliverDetailId,
    //     deliverDetail.employeeId,
    //     deliverDetail.awbStatusId,
    //   );
    // }
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
          syncDateTime: moment().toDate(),
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

      const lastDoPodDeliverHistory = last(doPodDeliverHistories);
      const awbStatus = await AwbStatus.findOne(
        lastDoPodDeliverHistory.awbStatusId,
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
            awbStatusIdLast: lastDoPodDeliverHistory.awbStatusId,
            latitudeDeliveryLast: lastDoPodDeliverHistory.latitudeDelivery,
            longitudeDeliveryLast: lastDoPodDeliverHistory.longitudeDelivery,
            awbStatusDateTimeLast: lastDoPodDeliverHistory.awbStatusDateTime,
            reasonIdLast: lastDoPodDeliverHistory.reasonId,
            syncDateTimeLast: lastDoPodDeliverHistory.syncDateTime,
            descLast: lastDoPodDeliverHistory.desc,
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
          lastDoPodDeliverHistory.awbStatusId,
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
    } // end of doPodDeliverHistories.length
  }

  public static async syncImage(
    payload: MobileSyncImagePayloadVm,
    file,
  ): Promise<MobileSyncImageResponseVm> {
    const result = new MobileSyncImageResponseVm();

    let url = null;
    let attachmentId = null;

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      },
    });

    if (attachment) {
      // attachment exist
      attachmentId = attachment.attachmentTmsId;
      url = attachment.url;
    } else {
      // upload image
      const pathId = `tms-delivery-${payload.imageType}`;
      attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        pathId,
      );
      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
        url = attachment.url;
      }
    }

    // NOTE: insert data
    if (attachmentId) {
      // TODO: validate doPodDeliverDetailId ??
      const doPodDeliverAttachment = await DoPodDeliverAttachment.create();
      doPodDeliverAttachment.doPodDeliverDetailId = payload.id;
      doPodDeliverAttachment.attachmentTmsId = attachmentId;
      doPodDeliverAttachment.type = payload.imageType;
      DoPodDeliverAttachment.save(doPodDeliverAttachment);
    }

    result.url = url;
    result.attachmentId = attachmentId;
    return result;
  }
}
