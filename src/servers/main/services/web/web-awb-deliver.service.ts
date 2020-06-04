// //#region import
import { getManager, LessThan, MoreThan } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbReturn } from '../../../../shared/orm-entity/awb-return';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverHistory } from '../../../../shared/orm-entity/do-pod-deliver-history';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    AwbDeliverManualSync, WebAwbDeliverSyncPayloadVm, WebAwbDeliverSyncResponseVm, WebDeliveryVm,
} from '../../models/web-awb-deliver.vm';
import { AwbService } from '../v1/awb.service';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
// //#endregion
export class WebAwbDeliverService {
  constructor() {}

  static async syncAwbDeliver(
    payload: WebAwbDeliverSyncPayloadVm,
  ): Promise<WebAwbDeliverSyncResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const response = new AwbDeliverManualSync();
    const result = new WebAwbDeliverSyncResponseVm();

    const dataItem = [];
    let onlyDriver = false;

    try {
      for (const delivery of payload.deliveries) {
        // TODO: check awb number
        // payload.role ['palkur', 'ct', 'sigesit']
        let syncManualDelivery = false;
        const awb = await AwbService.validAwbNumber(delivery.awbNumber);
        if (awb) {
          // const statusProblem = [AWB_STATUS.CODA, AWB_STATUS.BA, AWB_STATUS.RTN];
          const awbDeliver = await this.getDeliverDetail(delivery.awbNumber);
          if (awbDeliver) {
            // hardcode check role sigesit
            const roleIdSigesit = 23;
            if (permissonPayload.roleId == roleIdSigesit) {
              // check only own awb number
              if (
                awbDeliver.awbStatusIdLast == AWB_STATUS.ANT &&
                awbDeliver.doPodDeliver.userIdDriver ==
                  authMeta.userId
              ) {
                syncManualDelivery = true;
              } else {
                onlyDriver = true;
              }
            } else {
              syncManualDelivery = true;
            }

            if (syncManualDelivery) {
              // add handel final status
              const statusFinal = [AWB_STATUS.DLV];
              if (statusFinal.includes(awb.awbStatusIdLast)) {
                response.status = 'error';
                response.message = `Resi ${
                  delivery.awbNumber
                } sudah Final Status !`;
              } else {
                // set data deliver
                delivery.doPodDeliverId = awbDeliver.doPodDeliverId;
                delivery.doPodDeliverDetailId = awbDeliver.doPodDeliverDetailId;
                delivery.awbItemId = awbDeliver.awbItemId;
                // delivery.employeeId = authMeta.employeeId;
                await this.syncDeliver(delivery);

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
              }
            } else {
              response.status = 'error';
              if (onlyDriver) {
                response.message = `Resi ${
                  delivery.awbNumber
                }, bukan milik user sigesit login`;
              } else {
                response.message = `Resi ${
                  delivery.awbNumber
                }, bermasalah harap scan antar terlebih dahulu`;
              }
            }
          } else {
            // NOTE: Manual Status not POD only status problem
            delivery.awbItemId = awb.awbItemId;
            const manualStatus = await this.syncStatusManual(
              authMeta.userId,
              permissonPayload.branchId,
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

      // return array of data
      result.data = dataItem;
      return result;
    } catch (error) {
      response.status = 'error';
      response.message = `message error ${error.message}`;
      throw new BadRequestException(response);
    }
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
    const finalStatus = [AWB_STATUS.DLV];
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
      const reasonId = delivery.reasonId == 0 ? null : delivery.reasonId;
      DoPodDetailPostMetaQueueService.createJobByManualSync(
        delivery.awbItemId,
        delivery.awbStatusId,
        authMeta.userId,
        permissonPayload.branchId,
        authMeta.userId,
        reasonId,
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
    delivery: WebDeliveryVm,
    isReturn: boolean,
    awbId: number,
  ) {
    // NOTE: role palkur => CODA, BA, RETUR tidak perlu ANT
    try {
      if (delivery.awbStatusId != AWB_STATUS.DLV) {
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
        // TODO: queue by Bull need refactoring
        DoPodDetailPostMetaQueueService.createJobByManualStatus(
          delivery.awbItemId,
          delivery.awbStatusId,
          userId,
          branchId,
          delivery.reasonNotes,
        );
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
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
  ): Promise<boolean> {
    // NOTE: Insert into table awb return
    // check duplicate data
    let awbReturnData = await AwbReturn.findOne({
      where: {
        originAwbNumber: awbNumber,
        isDeleted: false,
      },
    });
    if (!awbReturnData) {
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
    return true;
  }
}
