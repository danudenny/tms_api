import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { AuthService } from '../../../../../shared/services/auth.service';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../../shared/orm-entity/bag-item-awb';
import { BagTrouble } from '../../../../../shared/orm-entity/bag-trouble';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { DeliveryService } from '../../../../../shared/services/delivery.service';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { Logger } from '@nestjs/common';
import { RedisService } from '../../../../../shared/services/redis.service';
import { WebScanInBagResponseVm } from '../../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../../models/web-scanin-bag.vm';
import moment = require('moment');

export class HubTransitDeliveryInService {

  /**
   * Scan in Bag Number (Hub) - NewFlow
   * Flow Data : https://docs.google.com/document/d/1wnrYqlCmZruMMwgI9d-ko54JGQDWE9sn2yjSYhiAIrg/edit
   * @param {WebScanInBagVm} payload
   * @param {boolean} isHub
   * @returns {Promise<WebScanInBagResponseVm>}
   * @memberof WebDeliveryInService
   */
  static async scanInBag(
    payload: WebScanInBagVm,
    isHub: boolean = true,
  ): Promise<WebScanInBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInBagResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const bagNumber of payload.bagNumber) {
      const response = {
        status: 'ok',
        trouble: false,
        message: 'Success',
      };

      const bagData = await DeliveryService.validBagNumber(bagNumber);

      if (bagData) {
        // NOTE: check condition disable on check branchIdNext
        // bagData.branchIdNext == permissonPayload.branchId;
        if (permissonPayload.branchId) {
          if (bagData.bagItemStatusIdLast) {
            const holdRedis = await RedisService.locking(
              `hold:bagscanin:${bagData.bagItemId}`,
              'locking',
            );
            if (holdRedis) {
              // AFTER Scan IN ===============================================
              // #region after scanin
              // NOTE: check doPodDetail
              const doPodDetail = await DoPodDetail.findOne({
                where: {
                  bagItemId: bagData.bagItemId,
                  isScanIn: false,
                  isDeleted: false,
                },
              });
              if (doPodDetail) {
                // save data to table pod_scan_id
                // Update Data doPodDetail
                // doPodDetail.podScanInId = podScanIn.podScanInId;
                doPodDetail.isScanIn = true;
                doPodDetail.updatedTime = timeNow;
                doPodDetail.userIdUpdated = authMeta.userId;
                await DoPodDetail.save(doPodDetail);

                // NOTE:
                // const doPod = await DoPod.findOne({
                //   where: {
                //     doPodId: doPodDetail.doPodId,
                //     isDeleted: false,
                //   },
                // });

                // counter total scan in
                // doPod.totalScanIn = doPod.totalScanIn + 1;
                // if (doPod.totalScanIn == 1) {
                //   doPod.firstDateScanIn = timeNow;
                //   doPod.lastDateScanIn = timeNow;
                // } else {
                //   doPod.lastDateScanIn = timeNow;
                // }
                // await DoPod.save(doPod);
              }

              totalSuccess += 1;
              // update bagItem
              const bagItem = await BagItem.findOne({
                where: {
                  bagItemId: bagData.bagItemId,
                },
              });

              if (bagItem) {
                bagItem.bagItemStatusIdLast = isHub ? 3500 : 2000;
                bagItem.branchIdLast = permissonPayload.branchId;
                bagItem.updatedTime = timeNow;
                bagItem.userIdUpdated = authMeta.userId;
                BagItem.save(bagItem);

                // NOTE: status DO_HUB (12600: drop off hub)
                if (isHub) {
                  const bagItemsAwb = await BagItemAwb.find({
                    where: {
                      bagItemId: bagData.bagItemId,
                      isDeleted: false,
                    },
                  });
                  if (bagItemsAwb && bagItemsAwb.length > 0) {
                    for (const itemAwb of bagItemsAwb) {
                      if (itemAwb.awbItemId) {
                        await DeliveryService.updateAwbAttr(
                          itemAwb.awbItemId,
                          null,
                          AWB_STATUS.DO_HUB,
                        );
                        // NOTE: queue by Bull
                        DoPodDetailPostMetaQueueService.createJobByDropoffBag(
                          itemAwb.awbItemId,
                          permissonPayload.branchId,
                          authMeta.userId,
                        );
                      }
                    }
                  } else {
                    Logger.log('### Data Bag Item Awb :: Not Found!!');
                  }
                }
              }

              // else {
              //   totalError += 1;
              //   response.status = 'error';
              //   response.message = `Gabung paket ${bagNumber} belum scan out di gerai sebelumnya`;
              // }
              // #endregion after scanin

              // remove key holdRedis
              RedisService.del(`hold:bagscanin:${bagData.bagItemId}`);
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = 'Server Busy';
            }

            // TODO: add bag trouble (with status 500)
          } else {
            totalSuccess += 1;
            // status 1000
            response.message = `Gabung paket ${bagNumber} belum scan out di gerai sebelumnya`;
            if (Number(bagData.bagItemStatusIdLast) == 2000) {
              response.message = `Gabung paket ${bagNumber} sudah pernah scan in`;
            }
          }
        } else {
          // TODO: bag trouble (warning)
          // NOTE: create data bag trouble
          const bagTroubleCode = await CustomCounterCode.bagTrouble(timeNow);
          const bagTrouble = BagTrouble.create({
            bagNumber,
            bagTroubleCode,
            bagTroubleStatus: 100,
            bagStatusId: 2000,
            employeeId: authMeta.employeeId,
            branchId: permissonPayload.branchId,
          });
          await BagTrouble.save(bagTrouble);

          totalError += 1;
          response.status = 'error';
          response.message = `Gabung paket ${bagNumber} bukan milik gerai ini`;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Gabung paket ${bagNumber} Tidak di Temukan`;
      }
      // push item
      dataItem.push({
        bagNumber,
        ...response,
      });
    } // end of loop

    result.totalData = payload.bagNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }
}
