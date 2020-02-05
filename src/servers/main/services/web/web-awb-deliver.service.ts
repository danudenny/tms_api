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
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbReturn } from '../../../../shared/orm-entity/awb-return';

export class WebAwbDeliverService {
  constructor() {
  }

  static async syncAwbDeliver(
    payload: WebAwbDeliverSyncPayloadVm,
  ): Promise<WebAwbDeliverSyncResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const response = new AwbDeliverManualSync();
    const result = new WebAwbDeliverSyncResponseVm();
    const dataItem = [];
    try {
      for (const delivery of payload.deliveries) {
        // TODO: check awb number
        // payload.role ['palkur', 'ct', 'sigesit']
        let syncManualDelivery = false;
        const awb = await AwbService.validAwbNumber(delivery.awbNumber);
        if (awb) {
          const statusProblem = [AWB_STATUS.CODA, AWB_STATUS.BA, AWB_STATUS.RTN];
          const awbDeliver = await this.getDeliverDetail(delivery.awbNumber);
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
                  // if (statusProblem.includes(delivery.awbStatusId)) {
                  // }
                  syncManualDelivery = true;
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

              // is return insert into awb return
              // TODO: if awb status DLV check awbNumber is_return ?? update relation awbNumber (RTS)
              if (payload.isReturn) {
                await this.createAwbReturn(
                  delivery.awbNumber,
                  awb.awbId,
                  permissonPayload.branchId,
                  authMeta.userId,
                );
              }

              response.status = 'ok';
              response.message = 'success';
            } else {
              response.status = 'error';
              response.message = `Resi ${delivery.awbNumber}, bermasalah harap scan antar terlebih dahulu`;
            }
          } else {
            // NOTE: Manual Status not POD only status problem
            delivery.awbItemId = awb.awbItemId;
            const manualStatus = await this.syncStatusManual(
              authMeta.userId,
              permissonPayload.branchId,
              payload.role,
              delivery,
              payload.isReturn,
              awb.awbId,
            );
            if (manualStatus) {
              response.status = 'ok';
              response.message = 'success';
            } else {
              response.status = 'error';
              response.message = `Resi ${delivery.awbNumber}, tidak dapat update status manual`;
            }
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
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
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
      const awbStatus = await AwbStatus.findOne(
        doPodDeliverHistory.awbStatusId,
      );
      // #region transaction data
      await getManager().transaction(async transactionEntityManager => {
        // insert data deliver history
        await transactionEntityManager.insert(
          DoPodDeliverHistory,
          doPodDeliverHistory,
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

      // NOTE: queue by Bull need refactoring
      DoPodDetailPostMetaQueueService.createJobByManualSync(
        delivery.awbItemId,
        delivery.awbStatusId,
        authMeta.userId,
        permissonPayload.branchId,
        authMeta.userId,
        delivery.reasonId,
        delivery.reasonNotes,
        delivery.consigneeNameNote,
        awbStatus.awbStatusName,
        awbStatus.awbStatusTitle,
      );

    } else {
      console.log('##### Data Not Valid', delivery);
    }
  }

  private static async syncStatusManual(
    userId: number,
    branchId: number,
    role: string,
    delivery: WebDeliveryVm,
    isReturn: boolean,
    awbId: number,
  ) {
    let syncManualDelivery = false;
    // role palkur => CODA, BA, RETUR tidak perlu ANT
    // const statusProblem = [AWB_STATUS.CODA, AWB_STATUS.BA, AWB_STATUS.RTN];

    if (delivery.awbStatusId != AWB_STATUS.DLV) {
      switch (role) {
        case 'ct':
          syncManualDelivery = true;
          break;
        case 'palkur':
          // if (statusProblem.includes(delivery.awbStatusId)) {
          // }
          syncManualDelivery = true;
          break;
        default:
          break;
      }
      if (syncManualDelivery) {
        if (isReturn) {
          // TODO: handle is return status??
          // NOTES: Insert into table awb return
          await this.createAwbReturn(
            delivery.awbNumber,
            awbId,
            branchId,
            userId,
          );
        }

        // Update status awb item attr
        // await AwbService.updateAwbAttr(
        //   delivery.awbItemId,
        //   delivery.awbStatusId,
        //   null,
        // );

        // TODO: queue by Bull need refactoring
        DoPodDetailPostMetaQueueService.createJobByManualStatus(
          delivery.awbItemId,
          delivery.awbStatusId,
          userId,
          branchId,
          delivery.reasonNotes,
        );
      }
    }
    return syncManualDelivery;
  }

  private static async getDeliverDetail(awbNumber: string): Promise<DoPodDeliverDetail> {
    const awbRepository = new OrionRepositoryService(
      DoPodDeliverDetail,
    );
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.select({
      doPodDeliverDetailId: true,
      doPodDeliverId: true,
      awbItemId: true,
      awbNumber: true,
      awbStatusIdLast: true,
      awbStatusDateTimeLast: true,
      doPodDeliver: {
        branchId: true,
        userIdDriver: true,
      },
    });
    q.where(
      e => e.awbNumber,
      w => w.equals(awbNumber),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderBy({ updatedTime: 'DESC' });
    q.take(1);
    return await q.exec();
  }

  private static async createAwbReturn(
    awbNumber: string,
    awbId: number,
    branchId: number,
    userId: number,
  ): Promise<AwbReturn> {
    // NOTES: Insert into table awb return
    // check duplicate data
    let awbReturnData = await AwbReturn.findOne({
      where: {
        originAwbNumber: awbNumber,
        isDeleted: false,
      },
    });
    if (awbReturnData) {
      // TODO: update awb status ??
    } else {
      awbReturnData = AwbReturn.create({
          originAwbId: awbId,
          originAwbNumber: awbNumber,
          branchId,
          userIdCreated: userId,
          userIdUpdated: userId,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
      });
      await AwbReturn.insert(awbReturnData);
    }
    return awbReturnData;
  }
}
