// #region import
import { getManager, MoreThan } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import {
    DoPodDeliverRepository,
} from '../../../../shared/orm-repository/do-pod-deliver.repository';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../shared/services/awb-trouble.service';
import { RedisService } from '../../../../shared/services/redis.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    MobileScanOutAwbResponseVm,
} from '../../models/mobile-scanout-response.vm';
import {
    MobileScanOutAwbVm,
    TransferAwbDeliverVm,
} from '../../models/mobile-scanout.vm';
import { AwbService } from '../v1/awb.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';

// #endregion

export class LastMileDeliveryOutService {

  /**
   * Create DO POD Deliver
   * with type: Deliver (Sigesit)
   * @param {MobileScanOutCreateDeliveryVm} payload
   * @returns {Promise<MobileScanOutCreateResponseVm>}
   * @memberof MobileDeliveryOutService
   */
  
  static async scanOutAwbDeliver(
    payload: MobileScanOutAwbVm,
  ): Promise<MobileScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const result = new MobileScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };

      const awb = await AwbService.validAwbNumber(awbNumber);
      if (awb) {
        // TODO: validation need improvement
        // handle if awb status is null
        let notDeliver = true;
        if (awb.awbStatusIdLast && awb.awbStatusIdLast != 0) {
          notDeliver = awb.awbStatusIdLast != AWB_STATUS.ANT ? true : false;
        }

        // NOTE: first must scan in branch
        if (notDeliver) {
          const statusCode = await AwbService.awbStatusGroup(
            awb.awbStatusIdLast,
          );
          // save data to awb_troubleß
          if (statusCode != 'IN') {
            const branchName = awb.branchLast ? awb.branchLast.branchName : '';
            await AwbTroubleService.fromScanOut(
              awbNumber,
              branchName,
              awb.awbStatusIdLast,
            );
          }

          // Add Locking setnx redis
          const holdRedis = await RedisService.locking(
            `hold:scanoutant:${awb.awbItemId}`,
            'locking',
          );
          if (holdRedis) {
            // save table do_pod_detail
            // NOTE: create data do pod detail per awb number
            const doPodDeliverDetail = DoPodDeliverDetail.create();
            doPodDeliverDetail.doPodDeliverId = payload.doPodId;
            doPodDeliverDetail.awbId = awb.awbId;
            doPodDeliverDetail.awbItemId = awb.awbItemId;
            doPodDeliverDetail.awbNumber = awbNumber;
            doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
            await DoPodDeliverDetail.save(doPodDeliverDetail);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // Update do_pod
            const doPodDeliver = await DoPodDeliverRepository.getDataById(
              payload.doPodId,
            );

            if (doPodDeliver) {
              // counter total scan out
              const totalAwb = doPodDeliver.totalAwb + 1;
              await DoPodDeliver.update(doPodDeliver.doPodDeliverId, {
                totalAwb,
              });
              await AwbService.updateAwbAttr(
                awb.awbItemId,
                AWB_STATUS.ANT,
                null,
              );
              // NOTE: queue by Bull ANT
              DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
                awb.awbItemId,
                AWB_STATUS.ANT,
                permissonPayload.branchId,
                authMeta.userId,
                doPodDeliver.userDriver.employeeId,
                doPodDeliver.userDriver.employee.employeeName,
              );
            }
            // #endregion after scanout

            totalSuccess += 1;
            // remove key holdRedis
            RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Server Busy: Resi ${awbNumber} sudah di proses.`;
          }
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Resi ${awbNumber} sudah di proses.`;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        awbNumber,
        ...response,
      });
    } // end of loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  static async transferAwbNumber(
    payload: TransferAwbDeliverVm,
  ): Promise<MobileScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();

    const dataItem = [];
    const result = new MobileScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };

      const awb = await AwbService.validAwbNumber(awbNumber);
      if (awb) {
        // NOTE: TRANSFER AWB NUMBER
        const awbDeliver = await DoPodDeliverDetail.findOne({
          where: {
            awbNumber,
            awbStatusIdLast: AWB_STATUS.ANT,
            isDeleted: false,
          },
        });
        // handle only status ANT
        if (awbDeliver) {
          // Add Locking setnx redis
          const holdRedis = await RedisService.locking(
            `hold:scanout-transfer:${awbDeliver.awbItemId}`,
            'locking',
          );
          if (holdRedis) {
            // Update data do pod detail per awb number
            // doPodDeliverId;
            await DoPodDeliverDetail.update(
              awbDeliver.doPodDeliverDetailId,
              {
                isDeleted: true,
                userIdUpdated: authMeta.userId,
                updatedTime: moment().toDate(),
              },
            );

            // balance total awb
            await getManager().transaction(
              async transactionEntityManager => {
                const awbItemAttr = await AwbItemAttr.findOne({
                  where: {
                    awbItemId: awbDeliver.awbItemId,
                    isDeleted: false,
                  },
                });
                if (awbItemAttr) {
                  await transactionEntityManager.update(
                    AwbItemAttr,
                    awbItemAttr.awbItemAttrId,
                    {
                      awbStatusIdLast: AWB_STATUS.IN_BRANCH,
                      updatedTime: moment().toDate(),
                    },
                  );
                }

                await transactionEntityManager.decrement(
                  DoPodDeliver,
                  {
                    doPodDeliverId: awbDeliver.doPodDeliverId,
                    totalAwb: MoreThan(0),
                  },
                  'totalAwb',
                  1,
                );
              },
            );

            totalSuccess += 1;
            // remove key holdRedis
            RedisService.del(`hold:scanout-transfer:${awbDeliver.awbItemId}`);
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Server Busy: Resi ${awbNumber} sudah di proses.`;
          }
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Resi ${awbNumber}, bermasalah harap scan in terlebih dahulu`;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        awbNumber,
        ...response,
      });
    } // end loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }
}
