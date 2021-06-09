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
import { AwbNotificationMailQueueService } from '../../../queue/services/notification/awb-notification-mail-queue.service';
import { DoPodReturnDetailService } from '../master/do-pod-return-detail.service';
import { JwtPermissionTokenPayload } from '../../../../shared/interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../../../../shared/models/auth-login-metadata.model';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodReturnDetail } from '../../../../shared/orm-entity/do-pod-return-detail';
import { DoPodReturnHistory } from '../../../../shared/orm-entity/do-pod-return-history';
import { DoPodReturn } from '../../../../shared/orm-entity/do-pod-return';
// //#endregion
export class WebAwbDeliverService {
  constructor() {}

  // TODO: refactoring code ASAP
  static async syncAwbDeliver(
    payload: WebAwbDeliverSyncPayloadVm,
  ): Promise<WebAwbDeliverSyncResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const response = new AwbDeliverManualSync();
    const result = new WebAwbDeliverSyncResponseVm();

    const dataItem = [];
    const onlyDriver = false;

    try {
      for (const delivery of payload.deliveries) {
        // TODO: check awb number
        // payload.role ['palkur', 'ct', 'sigesit']
        const syncManualDelivery = false;
        const awb = await AwbService.validAwbNumber(delivery.awbNumber);
        if (awb) {
          // add handel status Cod problem
          const statusCodProblem = [AWB_STATUS.CODB, AWB_STATUS.CODOC];
          if (AWB_STATUS.RTN == delivery.awbStatusId && !await AwbService.isManifested(awb.awbItemId)){
            response.status = 'error';
            response.message = `Resi ${delivery.awbNumber} belum pernah di MANIFESTED`;
          } else if (
            awb.awbItem.awb.isCod == false &&
            statusCodProblem.includes(delivery.awbStatusId)
          ) {
            response.status = 'error';
            response.message = `Resi ${delivery.awbNumber} bukan resi COD !`;
          } else {

            const awbDeliverDetail = await this.getDeliverDetail(delivery.awbNumber);
            const awbReturnDetail = await DoPodReturnDetailService.getDoPodReturnDetailByAwbNumber(delivery.awbNumber);
            let isReturnAwb = false;
            let isDeliverAwb = false;
            if (awbReturnDetail && awbDeliverDetail) {
              if (awbReturnDetail.updatedTime > awbDeliverDetail.updatedTime) {
                isReturnAwb = true;
              } else {
                isDeliverAwb = true;
              }
            } else if (awbReturnDetail) {
              isReturnAwb = true;
            } else if (awbDeliverDetail) {
              isDeliverAwb = true;
            }

            if (isDeliverAwb) {
              // hardcode check role sigesit
              await this.deliverProcess(
                permissonPayload,
                awbDeliverDetail,
                authMeta,
                syncManualDelivery,
                onlyDriver,
                awb,
                response,
                delivery,
                payload);
            } else if (isReturnAwb) {
              await this.returnProcess(
                permissonPayload,
                awbReturnDetail,
                authMeta,
                syncManualDelivery,
                onlyDriver,
                awb,
                response,
                delivery,
                payload);
            } else {
              // NOTE: Manual Status not POD only status problem (not have spk)
              delivery.awbItemId = awb.awbItemId;
              if (delivery.awbStatusId != AWB_STATUS.DLV) {
                const manualStatus = await this.syncStatusManual(
                  authMeta.userId,
                  permissonPayload.branchId,
                  delivery,
                  payload.isReturn,
                  awb.awbId,
                );
                const messageError = `Resi ${delivery.awbNumber}, tidak dapat update status manual`;
                response.status = manualStatus ? 'ok' : 'error';
                response.message = manualStatus ? 'success' : messageError ;
              } else {
                // status DLV, but not have spk
                response.status = 'error';
                response.message = `Resi ${
                  delivery.awbNumber
                }, tidak memiliki surat jalan, harap buatkan surat jalan terlebih dahulu!`;
              }
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

  private static async deliverProcess(
    permissonPayload: JwtPermissionTokenPayload,
    awbDeliverDetail: DoPodDeliverDetail,
    authMeta: AuthLoginMetadata,
    syncManualDelivery: boolean,
    onlyDriver: boolean,
    awb: AwbItemAttr,
    response: AwbDeliverManualSync,
    delivery: WebDeliveryVm,
    payload: WebAwbDeliverSyncPayloadVm,
    ) {
    const roleIdSigesit = 23;
    if (permissonPayload.roleId == roleIdSigesit) {
      // check only own awb number
      if (awbDeliverDetail.awbStatusIdLast == AWB_STATUS.ANT &&
        awbDeliverDetail.doPodDeliver.userIdDriver ==
        authMeta.userId) {
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
        response.message = `Resi ${delivery.awbNumber} sudah Final Status !`;
      } else {
        // check awb is cod
        if (awb.awbItem.awb.isCod == true && delivery.awbStatusId == AWB_STATUS.DLV) {
          response.status = 'error';
          response.message = `Resi ${delivery.awbNumber}, adalah resi COD, tidak dapat melakukan POD Manual!`;
        } else {
          // set data deliver
          delivery.doPodDeliverId = awbDeliverDetail.doPodDeliverId;
          delivery.doPodDeliverDetailId = awbDeliverDetail.doPodDeliverDetailId;
          delivery.awbItemId = awbDeliverDetail.awbItemId;
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
      }
    } else {
      response.status = 'error';
      if (onlyDriver) {
        response.message = `Resi ${delivery.awbNumber}, bukan milik user sigesit login`;
      } else {
        response.message = `Resi ${delivery.awbNumber}, bermasalah harap scan antar terlebih dahulu`;
      }
    }
  }

  private static async returnProcess(
    permissonPayload: JwtPermissionTokenPayload,
    awbReturnDetail: DoPodReturnDetail,
    authMeta: AuthLoginMetadata,
    syncManualDelivery: boolean,
    onlyDriver: boolean,
    awb: AwbItemAttr,
    response: AwbDeliverManualSync,
    delivery: WebDeliveryVm,
    payload: WebAwbDeliverSyncPayloadVm,
    ) {
    const roleIdSigesit = 23;
    if (permissonPayload.roleId == roleIdSigesit) {
      // check only own awb number
      if (awbReturnDetail.awbStatusIdLast == AWB_STATUS.ANT &&
        awbReturnDetail.doPodReturn.userIdDriver ==
        authMeta.userId) {
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
        response.message = `Resi ${delivery.awbNumber} sudah Final Status !`;
      } else {
        // check awb is cod
        if (awb.awbItem.awb.isCod == true && delivery.awbStatusId == AWB_STATUS.DLV) {
          response.status = 'error';
          response.message = `Resi ${delivery.awbNumber}, adalah resi COD, tidak dapat melakukan POD Manual!`;
        } else {
          // set data deliver
          delivery.doPodDeliverId = awbReturnDetail.doPodReturnId;
          delivery.doPodDeliverDetailId = awbReturnDetail.doPodReturnDetailId;
          delivery.awbItemId = awbReturnDetail.awbItemId;
          // delivery.employeeId = authMeta.employeeId;
          await this.syncReturn(delivery);
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
      }
    } else {
      response.status = 'error';
      if (onlyDriver) {
        response.message = `Resi ${delivery.awbNumber}, bukan milik user sigesit login`;
      } else {
        response.message = `Resi ${delivery.awbNumber}, bermasalah harap scan antar terlebih dahulu`;
      }
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
      const awbStatus = await AwbStatus.findOne({
        where: {
          awbStatusId: doPodDeliverHistory.awbStatusId,
          isDeleted: false,
        },
        cache: true,
      });
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
      DoPodDetailPostMetaQueueService.createJobV2ByManual(
        delivery.awbItemId,
        delivery.awbStatusId,
        authMeta.userId,
        permissonPayload.branchId,
        delivery.reasonNotes,
        reasonId,
        delivery.consigneeNameNote,
      );
      // NOTE: mail notification
      AwbNotificationMailQueueService.perform(
        delivery.awbItemId,
        delivery.awbStatusId,
      );

    } else {
      console.log('##### Data Not Valid', delivery);
    }
  }

  private static async syncReturn(delivery: WebDeliveryVm) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // Generate History by Status input pod manual
    const doPodReturnHistory = DoPodReturnHistory.create({
      doPodReturnDetailId: delivery.doPodDeliverDetailId,
      awbStatusId: delivery.awbStatusId,
      reasonId: delivery.reasonId,
      syncDateTime: moment().toDate(),
      desc: delivery.reasonNotes,
      awbStatusDateTime: moment().toDate(),
      historyDateTime: moment().toDate(),
      employeeIdDriver: null,
    });

    // TODO: validation check final status last
    const awbReturn = await DoPodReturnDetail.findOne({
      where: {
        doPodReturnDetailId: delivery.doPodDeliverDetailId,
        isDeleted: false,
      },
    });
    const finalStatus = [AWB_STATUS.DLV];
    if (awbReturn && !finalStatus.includes(awbReturn.awbStatusIdLast)) {
      const awbStatus = await AwbStatus.findOne({
        where: {
          awbStatusId: doPodReturnHistory.awbStatusId,
          isDeleted: false,
        },
        cache: true,
      });
      // #region transaction data
      await getManager().transaction(async transactionEntityManager => {
        // insert data deliver history
        await transactionEntityManager.insert(
          DoPodReturnHistory,
          doPodReturnHistory,
        );

        // Update data DoPodDeliverDetail
        await transactionEntityManager.update(
          DoPodReturnDetail,
          delivery.doPodDeliverDetailId,
          {
            awbStatusIdLast: doPodReturnHistory.awbStatusId,
            awbStatusDateTimeLast: doPodReturnHistory.awbStatusDateTime,
            reasonIdLast: doPodReturnHistory.reasonId,
            syncDateTimeLast: doPodReturnHistory.syncDateTime,
            descLast: doPodReturnHistory.desc,
            consigneeName: delivery.consigneeNameNote,
            updatedTime: moment().toDate(),
          },
        );
        // TODO: validation DoPodDeliver
        const doPodReturn = await DoPodReturn.findOne({
          where: {
            doPodReturnId: delivery.doPodDeliverId,
            isDeleted: false,
          },
        });
        if (doPodReturn) {
          if (awbStatus.isProblem) {
            await transactionEntityManager.increment(
              DoPodReturn,
              {
                doPodReturnId: delivery.doPodDeliverId,
                totalProblem: LessThan(doPodReturn.totalAwb),
              },
              'totalProblem',
              1,
            );
          } else if (awbStatus.isFinalStatus) {
            await transactionEntityManager.increment(
              DoPodReturn,
              {
                doPodReturnId: delivery.doPodDeliverId,
                totalReturn: LessThan(doPodReturn.totalAwb),
              },
              'totalReturn',
              1,
            );
            // balance total problem
            await transactionEntityManager.decrement(
              DoPodReturn,
              {
                doPodReturnId: delivery.doPodDeliverId,
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
      DoPodDetailPostMetaQueueService.createJobV2ByManual(
        delivery.awbItemId,
        delivery.awbStatusId,
        authMeta.userId,
        permissonPayload.branchId,
        delivery.reasonNotes,
        reasonId,
        delivery.consigneeNameNote,
      );
      // NOTE: mail notification
      AwbNotificationMailQueueService.perform(
        delivery.awbItemId,
        delivery.awbStatusId,
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
      DoPodDetailPostMetaQueueService.createJobV2ByManual(
        delivery.awbItemId,
        delivery.awbStatusId,
        userId,
        branchId,
        delivery.reasonNotes,
        null,
        null,
      );
      // NOTE: mail notification
      AwbNotificationMailQueueService.perform(
        delivery.awbItemId,
        delivery.awbStatusId,
      );
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
      updatedTime: true,
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
          branchFromId: branchId,
          userIdCreated: userId,
          userIdUpdated: userId,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
      });
      await AwbReturn.insert(awbReturnData);
    } else {
      AwbReturn.update(awbReturnData.awbReturnId, {
          branchId,
          userIdUpdated: userId,
          updatedTime: moment().toDate(),
      });
    }
    return true;
  }
}
