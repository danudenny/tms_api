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
import { AwbService } from '../v1/awb.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { V1MobileInitDataService } from './v1/mobile-init-data.service';

export class MobileSyncService {
  public static async syncByRequest(payload: MobileSyncPayloadVm) {
    for (const delivery of payload.deliveries) {
      await this.syncDeliver(delivery);
    }
    return V1MobileInitDataService.getInitDataByRequest(payload.lastSyncDateTime);
  }

  public static async syncDeliver(delivery: MobileDeliveryVm) {
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
      const lastDoPodDeliverHistory = last(doPodDeliverHistories);

      // TODO: validation check final status last
      const awbdDelivery = await DoPodDeliverDetail.findOne({
        relations: ['doPodDeliver'],
        where: {
          doPodDeliverDetailId: delivery.doPodDeliverDetailId,
          isDeleted: false,
        },
      });
      const finalStatus = [AWB_STATUS.DLV, AWB_STATUS.BROKE, AWB_STATUS.RTS];
      if (awbdDelivery && !finalStatus.includes(awbdDelivery.awbStatusIdLast)) {
        const awbStatus = await AwbStatus.findOne(
          lastDoPodDeliverHistory.awbStatusId,
        );

        // #region transaction data
        await getManager().transaction(async transactionEntityManager => {
          await transactionEntityManager.insert(
            DoPodDeliverHistory,
            doPodDeliverHistories,
          );

          // Update data DoPodDeliverDetail
          await transactionEntityManager.update(
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
            // TODO: check current awb status only ANT and problem increment totalProblem
            if (awbStatus.isProblem) {
              await transactionEntityManager.increment(
                DoPodDeliver,
                {
                  doPodDeliverId: delivery.doPodDeliverId,
                  totalProblem: LessThan(doPodDeliver.totalAwb),
                },
                'totalProblem',
                1,
              );
            } else if (awbStatus.isFinalStatus) {
              await transactionEntityManager.increment(
                DoPodDeliver,
                {
                  doPodDeliverId: delivery.doPodDeliverId,
                  totalDelivery: LessThan(doPodDeliver.totalAwb),
                },
                'totalDelivery',
                1,
              );
              // balance total problem
              await transactionEntityManager.decrement(
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
        });
        // #endregion of transaction

        // TODO: queue by Bull need refactoring
        DoPodDetailPostMetaQueueService.createJobByMobileSync(
          awbdDelivery.awbItemId,
          delivery.awbStatusId,
          awbdDelivery.doPodDeliver.userId,
          awbdDelivery.doPodDeliver.branchId,
          awbdDelivery.userIdCreated,
          delivery.employeeId,
          lastDoPodDeliverHistory.reasonId,
          lastDoPodDeliverHistory.desc,
          delivery.consigneeNameNote,
          awbStatus.awbStatusName,
          awbStatus.awbStatusTitle,
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
