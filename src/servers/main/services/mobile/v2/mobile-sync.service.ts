// #region import
import { last } from 'lodash';
import { getManager, LessThan, MoreThan } from 'typeorm';

import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { AttachmentTms } from '../../../../../shared/orm-entity/attachment-tms';
import { AwbStatus } from '../../../../../shared/orm-entity/awb-status';
import { DoPodDeliver } from '../../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverHistory } from '../../../../../shared/orm-entity/do-pod-deliver-history';
import { DoPodDeliverAttachment } from '../../../../../shared/orm-entity/do_pod_deliver_attachment';
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import {
  DoPodDetailPostMetaQueueService,
} from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { MobileDeliveryVm } from '../../../models/mobile-delivery.vm';
import {
  MobileSyncImagePayloadVm, MobileSyncPayloadVm, MobileSyncImageDataPayloadVm,
} from '../../../models/mobile-sync-payload.vm';
import { MobileSyncImageResponseVm, MobileSyncDataResponseVm, MobileSyncAwbVm, MobileSyncImageDataResponseVm } from '../../../models/mobile-sync-response.vm';

import moment = require('moment');
import { PinoLoggerService } from '../../../../../shared/services/pino-logger.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { UploadImagePodQueueService } from '../../../../queue/services/upload-pod-image-queue.service';
import { CodPayment } from '../../../../../shared/orm-entity/cod-payment';
import { ServiceUnavailableException } from '@nestjs/common';
import { RedisService } from '../../../../../shared/services/redis.service';
// #endregion

export class V2MobileSyncService {

  public static async syncByRequest(
    payload: MobileSyncPayloadVm,
  ): Promise<MobileSyncDataResponseVm> {
    const result = new MobileSyncDataResponseVm();
    const dataItem: MobileSyncAwbVm[] = [];
    for (const delivery of payload.deliveries) {
      // Locking redis
      const holdRedis = await RedisService.redlock(
        `hold:mobileSync:${delivery.awbNumber}`,
        10,
      );
      const response = {
        process: false,
        message: 'Data Not Valid',
      };

      if (holdRedis) {
        const process = await this.syncDeliver(delivery);
        if (process) {
          response.process = process;
          response.message = 'Success';
        }
        // remove key holdRedis
        RedisService.del(`hold:mobileSync:${delivery.awbNumber}`);
      }

      // push item
      dataItem.push({
        awbNumber: delivery.awbNumber,
        ...response,
      });

    } // endof loop

    result.data = dataItem;
    return result;
  }

  public static async syncDeliver(delivery: MobileDeliveryVm) {
    const doPodDeliverHistories: DoPodDeliverHistory[] = [];
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    let process = false;
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
      // NOTE: check data timestamp and time server
      // handle time status offline
      const historyDateTime =
        lastDoPodDeliverHistory.awbStatusDateTime <
          lastDoPodDeliverHistory.syncDateTime
          ? lastDoPodDeliverHistory.awbStatusDateTime
          : lastDoPodDeliverHistory.syncDateTime;

      try {
        const awbdDelivery = await this.getDoPodDeliverDetail(delivery.doPodDeliverDetailId);
        const finalStatus = [AWB_STATUS.DLV, AWB_STATUS.BROKE, AWB_STATUS.RTS];
        if (awbdDelivery && !finalStatus.includes(awbdDelivery.awbStatusIdLast)) {
          const awbStatus = await AwbStatus.findOne(
            { awbStatusId: lastDoPodDeliverHistory.awbStatusId },
            { cache: true },
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

            // only awb COD and DLV
            if (delivery.isCOD && lastDoPodDeliverHistory.awbStatusId == AWB_STATUS.DLV) {
              // find and update
              const codPayment = await transactionEntityManager.findOne(
                CodPayment,
                {
                  where: {
                    doPodDeliverDetailId: delivery.doPodDeliverDetailId,
                  },
                },
              );
              if (codPayment) {
                // update data
                await transactionEntityManager.update(
                  CodPayment,
                  {
                    codPaymentId: codPayment.codPaymentId,
                  },
                  {
                    codValue: delivery.totalCodValue,
                    codPaymentMethod: delivery.codPaymentMethod,
                    codPaymentService: delivery.codPaymentService,
                    note: delivery.note,
                    noReference: delivery.noReference,
                    userIdUpdated: authMeta.userId,
                    updatedTime: moment().toDate(),
                  },
                );
              } else {
                await transactionEntityManager.insert(CodPayment, {
                  awbNumber: delivery.awbNumber,
                  codValue: delivery.totalCodValue,
                  codPaymentMethod: delivery.codPaymentMethod,
                  codPaymentService: delivery.codPaymentService,
                  note: delivery.note,
                  noReference: delivery.noReference,
                  doPodDeliverDetailId: delivery.doPodDeliverDetailId,
                  userIdCreated: authMeta.userId,
                  userIdUpdated: authMeta.userId,
                  createdTime: moment().toDate(),
                  updatedTime: moment().toDate(),
                });
              }
              // CodPaymentQueueService.perform(delivery.awbNumber, delivery.noReference);
            }

            const doPodDeliver = await DoPodDeliver.findOne({
              where: {
                doPodDeliverId: delivery.doPodDeliverId,
                isDeleted: false,
              },
            });
            if (doPodDeliver) {

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

          // NOTE: queue by Bull
          DoPodDetailPostMetaQueueService.createJobV1MobileSync(
            awbdDelivery.awbItemId,
            lastDoPodDeliverHistory.awbStatusId,
            authMeta.userId,
            awbdDelivery.branchId,
            authMeta.userId,
            delivery.employeeId,
            lastDoPodDeliverHistory.reasonId,
            lastDoPodDeliverHistory.desc,
            delivery.consigneeNameNote,
            awbStatus.awbStatusName,
            awbStatus.awbStatusTitle,
            historyDateTime,
            lastDoPodDeliverHistory.latitudeDelivery,
            lastDoPodDeliverHistory.longitudeDelivery,
          );
          process = true;
        } else {
          PinoLoggerService.log('##### Data Not Valid', delivery);
        }
      } catch (error) {
        console.error(error);
        throw new ServiceUnavailableException(error);
      }
    } // end of doPodDeliverHistories.length
    return process;
  }

  public static async syncImage(
    payload: MobileSyncImagePayloadVm,
    file,
  ): Promise<MobileSyncImageResponseVm> {
    const result = new MobileSyncImageResponseVm();
    const authMeta = AuthService.getAuthData();
    PinoLoggerService.log('#### DEBUG USER SYNC IMAGE : ', authMeta);

    let url = null;
    let attachmentId = null;

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      },
      lock: { mode: 'pessimistic_write' },
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
      await DoPodDeliverAttachment.save(doPodDeliverAttachment);

      // send to background reupload s3 with awb number
      UploadImagePodQueueService.perform(
        payload.id,
        url,
        payload.imageType,
      );
    }

    result.url = url;
    result.attachmentId = attachmentId;
    return result;
  }

  public static async syncImageData(
    payload: MobileSyncImageDataPayloadVm,
    file,
  ): Promise<MobileSyncImageDataResponseVm> {
    const result = new MobileSyncImageDataResponseVm();

    let url = null;
    let attachmentId = null;

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      },
      lock: { mode: 'pessimistic_write' },
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

    // NOTE: insert data array
    let total = 0;
    if (attachmentId && payload.data) {
      const data = payload.data.split(';');
      for (const item of data) {
        if (item) {
          const doPodDeliverAttachment = await DoPodDeliverAttachment.create();
          doPodDeliverAttachment.doPodDeliverDetailId = item;
          doPodDeliverAttachment.attachmentTmsId = attachmentId;
          doPodDeliverAttachment.type = payload.imageType;
          await DoPodDeliverAttachment.save(doPodDeliverAttachment);

          // send to background reupload s3 with awb number
          UploadImagePodQueueService.perform(
            item,
            url,
            payload.imageType,
          );
          total += 1;
        }
      }
    } else {
      PinoLoggerService.log('#### Payload Data Not Valid : ', payload.data);
    }

    result.url = url;
    result.attachmentId = attachmentId;
    result.totalData = total;
    return result;
  }

  private static async getDoPodDeliverDetail(
    doPodDeliverDetailId: string,
  ): Promise<any> {
    const query = `
      SELECT
        dpdd.awb_status_id_last as "awbStatusIdLast",
        dpdd.awb_item_id as "awbItemId",
        dpd.branch_id as "branchId"
      FROM do_pod_deliver_detail dpdd
      INNER JOIN do_pod_deliver dpd ON dpd.do_pod_deliver_id = dpdd.do_pod_deliver_id
      WHERE
        dpdd.do_pod_deliver_detail_id = :doPodDeliverDetailId AND
        dpdd.is_deleted = FALSE
    `;
    const rawData = await RawQueryService.queryWithParams(query, {
      doPodDeliverDetailId,
    });
    return rawData.length ? rawData[0] : null;
  }
}
