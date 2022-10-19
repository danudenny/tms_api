// //#region import
import { getManager, LessThan, MoreThan } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
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
import { AwbReturnService } from '../master/awb-return.service';
import { RoleGroupService } from '../../../../shared/services/role-group.service';
import { AwbCodService } from '../cod/awb-cod.service';
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
    let onlyDriver = false;

    try {
      for (const delivery of payload.deliveries) {
        // payload.role ['palkur', 'ct', 'sigesit']
        let syncManualDelivery = false;
        // TODO: need improve query get data check awb number
        const awb = await AwbService.validAwbNumber(delivery.awbNumber);
        if (awb) {
          // add handel status Cod problem
          const statusCodProblem = [AWB_STATUS.CODB, AWB_STATUS.CODOC];
          if (AWB_STATUS.RTN == delivery.awbStatusId && !await AwbService.isManifested(awb.awbNumber, awb.awbItemId)) {
            response.status = 'error';
            response.message = `Resi ${delivery.awbNumber} belum pernah di MANIFESTED`;
          } else if (
            awb.awbItem.awb.isCod == false &&
            statusCodProblem.includes(delivery.awbStatusId)
          ) {
            response.status = 'error';
            response.message = `Resi ${delivery.awbNumber} bukan resi COD !`;
          } else {
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
                  response.message = `Resi ${delivery.awbNumber} sudah Final Status !`;
                } else {
                  // set data deliver for sync data
                  delivery.doPodDeliverId = awbDeliver.doPodDeliverId;
                  delivery.doPodDeliverDetailId = awbDeliver.doPodDeliverDetailId;
                  delivery.awbItemId = awbDeliver.awbItemId;
                  delivery.totalCodValue = awb.awbItem.awb.totalCodValue;

                  // check awb is cod
                  if (this.isValidCod(awb.awbItem.awb.isCod, delivery.awbStatusId)) {
                    if (RoleGroupService.isRoleCodManual(permissonPayload.roleId, permissonPayload.isHeadOffice)) {
                      await this.syncDeliver(delivery, true);
                      response.status = 'ok';
                      response.message = 'success';
                    } else {
                      // no access cod manual
                      response.status = 'error';
                      response.message = `Resi ${
                        delivery.awbNumber
                      }, adalah resi COD, role user tidak dapat melakukan POD Manual!`;
                    }
                  } else {
                    await this.syncDeliver(delivery, false);
                    // TODO: if awb status DLV check awbNumber is_return ?? update relation awbNumber (RTS)
                    if (payload.isReturn) {
                      await AwbReturnService.createAwbReturn(
                        delivery.awbNumber,
                        awb.awbId,
                        permissonPayload.branchId,
                        authMeta.userId,
                        false,
                      );
                    }
                    response.status = 'ok';
                    response.message = 'success';
                  } // end valid awb status final
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

  private static async syncDeliver(delivery: WebDeliveryVm, isCod: boolean) {
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
            awbStatusDateLast : doPodDeliverHistory.awbStatusDateTime,
            reasonIdLast: doPodDeliverHistory.reasonId,
            syncDateTimeLast: doPodDeliverHistory.syncDateTime,
            descLast: doPodDeliverHistory.desc,
            consigneeName: delivery.consigneeNameNote,
            updatedTime: moment().toDate(),
          },
        );
        // only awb COD and DLV
        if (isCod) {
          await AwbCodService.transfer(
            {
              doPodDeliverDetailId: delivery.doPodDeliverDetailId,
              awbNumber: delivery.awbNumber,
              awbItemId: delivery.awbItemId,
              amount: delivery.totalCodValue,
              method: 'cash',
              service: 'COD Manual',
              noReference: `COD-MANUAL-${delivery.awbNumber}`,
              note: `user ${
                authMeta.displayName
              } (${authMeta.username}) melakukan cod manual sebesar ${
                delivery.totalCodValue
              }`,
            },
            permissonPayload.branchId,
            authMeta.userId,
            transactionEntityManager,
          );
        }

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

      await DoPodDeliver.update(
        { doPodDeliverId: delivery.doPodDeliverId },
        {
          updatedTime: moment().toDate(),
        },
      );

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
        await AwbReturnService.createAwbReturn(
          delivery.awbNumber,
          awbId,
          branchId,
          userId,
          false,
        );
      }
      // TODO: queue by Bull need refactoring
      DoPodDetailPostMetaQueueService.createJobV2ByManual(
        delivery.awbItemId,
        delivery.awbStatusId,
        userId,
        branchId,
        delivery.reasonNotes,
        delivery.awbStatusId == AWB_STATUS.CODB ? delivery.reasonId : null,
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

  private static isValidCod(isCod: boolean, awbStatusId: number) {
    return isCod == true && awbStatusId == AWB_STATUS.DLV;
  }

}
