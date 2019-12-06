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
    WebAwbDeliverSyncPayloadVm, WebDeliveryVm, WebAwbDeliverSyncResponseVm, AwbDeliverManualSync,
} from '../../models/web-awb-deliver.vm';
import { AwbService } from '../v1/awb.service';
import moment = require('moment');
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';

export class WebAwbDeliverService {
  constructor() {
  }

  // TODO: deprecated
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
    const response = new AwbDeliverManualSync();
    const result = new WebAwbDeliverSyncResponseVm();
    const dataItem = [];
    try {
      for (const delivery of payload.deliveries) {
        // TODO: check awb number
        const awb = await AwbService.validAwbNumber(delivery.awbNumber);
        if (awb) {
          // payload.role ['palkur', 'ct', 'sigesit']
          let syncManualDelivery = false;
          const statusProblem = [AWB_STATUS.CODA, AWB_STATUS.BA, AWB_STATUS.RTN];
          const awbDeliver = await DoPodDeliverDetail.findOne({
            relations: ['doPodDeliver'],
            where: {
              awbNumber: delivery.awbNumber,
              isDeleted: false,
            },
          });
          if (awbDeliver) {
            // NOTE: check validate role and status last
            if ((awbDeliver.awbStatusIdLast == AWB_STATUS.ANT) && (delivery.awbStatusId == AWB_STATUS.DLV)) {
              syncManualDelivery = true;
            } else {
              // check role
              // role palkur => CODA, BA, RETUR tidak perlu ANT
              switch (payload.role) {
                case 'ct':
                  syncManualDelivery = true;
                  break;
                case 'palkur':
                  if (statusProblem.includes(delivery.awbStatusId)) {
                    syncManualDelivery = true;
                  }
                  break;
                case 'sigesit':
                  // check only own awb number
                  if (
                    awbDeliver.awbStatusIdLast == AWB_STATUS.ANT &&
                    awbDeliver.doPodDeliver.userIdDriver == authMeta.userId
                  ) {
                    syncManualDelivery = true;
                  }
                  break;
                default:
                  break;
              }
            }

            if (syncManualDelivery) {
              // set data deliver
              delivery.doPodDeliverId = awbDeliver.doPodDeliverId;
              delivery.doPodDeliverDetailId = awbDeliver.doPodDeliverDetailId;
              delivery.awbItemId = awbDeliver.awbItemId;
              // delivery.employeeId = authMeta.employeeId;
              await this.syncDeliver(delivery);

              response.status = 'ok';
              response.message = 'success';
            } else {
              response.status = 'error';
              response.message = `Resi ${delivery.awbNumber}, bermasalah harap scan in terlebih dahulu`;
            }
          } else {
            response.status = 'error';
            response.message = `Resi ${delivery.awbNumber}, bermasalah harap scan antar terlebih dahulu`;
          }
        } else {
          response.status = 'error';
          response.message = `Resi ${delivery.awbNumber} tidak ditemukan`;
        }

        // push item
        dataItem.push({
          awbNumber: delivery.awbNumber,
          ...response,
        });
      } // end of for
    } catch (error) {
      response.status = 'error';
      response.message = `message error ${error.message}`;
      dataItem.push({
        awbNumber: '',
        ...response,
      });
    }

    // return array of data
    result.data = dataItem;
    return result;
  }

  private static async syncDeliver(delivery: WebDeliveryVm) {
    // Generate History by Status input pod manual
    const doPodDeliverHistory = DoPodDeliverHistory.create({
      doPodDeliverDetailId: delivery.doPodDeliverDetailId,
      awbStatusId: delivery.awbStatusId,
      reasonId: delivery.reasonId,
      syncDateTime: moment().toDate(),
      desc: delivery.reasonNotes,
      awbStatusDateTime: moment().toDate(),
      historyDateTime: moment().toDate(),
      employeeIdDriver: null,
    });

    // TODO: validation check final status last
    const awbdDelivery = await DoPodDeliverDetail.findOne({
      where: {
        doPodDeliverDetailId: delivery.doPodDeliverDetailId,
        isDeleted: false,
      },
    });
    const finalStatus = [AWB_STATUS.DLV, AWB_STATUS.BROKE, AWB_STATUS.RTS];
    if (awbdDelivery && !finalStatus.includes(awbdDelivery.awbStatusIdLast)) {
      // #region transaction data
      await getManager().transaction(async transactionEntityManager => {
        // insert data deliver history
        await transactionEntityManager.insert(
          DoPodDeliverHistory,
          doPodDeliverHistory,
        );

        const awbStatus = await AwbStatus.findOne(
          doPodDeliverHistory.awbStatusId,
        );
        // Update data DoPodDeliverDetail
        await transactionEntityManager.update(
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

      // Update status awb item attr
      await DeliveryService.updateAwbAttr(
        delivery.awbItemId,
        null,
        doPodDeliverHistory.awbStatusId,
      );

      // TODO: queue by Bull need refactoring
      DoPodDetailPostMetaQueueService.createJobByMobileSyncAwb(
        delivery.doPodDeliverDetailId,
        null,
        delivery.awbStatusId,
      );
    } else {
      console.log('##### Data Not Valid', delivery);
    }
  }
}
