import { Injectable } from '@nestjs/common';
import { MappingDoSmdResponseVm } from '../../models/mapping-do-smd.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

import moment = require('moment');
import {DoSmd} from '../../../../shared/orm-entity/do_smd';
import {OrionRepositoryService} from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { WebScanInBagVm } from '../../../main/models/web-scanin-bag.vm';
import { WebScanInBagResponseVm } from '../../../main/models/web-scanin-awb.response.vm';
import { BagService } from '../../../main/services/v1/bag.service';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { BagTroubleService } from '../../../../shared/services/bag-trouble.service';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { DropoffHub } from '../../../../shared/orm-entity/dropoff_hub';
import { BagItemHistoryQueueService } from '../../../queue/services/bag-item-history-queue.service';
import { BagDropoffHubQueueService } from '../../../queue/services/bag-dropoff-hub-queue.service';
import { DoPodDetailBagRepository } from '../../../../shared/orm-repository/do-pod-detail-bag.repository';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { WebScanInBaggingVm } from '../../models/scanin-hub-smd.payload.vm';
import { WebScanInBaggingResponseVm } from '../../models/scanin-hub-smd.response.vm';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { DropoffHubBagging } from '../../../../shared/orm-entity/dropoff_hub_bagging';
import { BaggingDropoffHubQueueService } from '../../../queue/services/bagging-dropoff-hub-queue.service';

@Injectable()
export class SmdHubService {

  static async scanInBagHub(payload: WebScanInBagVm): Promise<WebScanInBagResponseVm> {
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

      const bagData = await BagService.validBagNumber(bagNumber);
      if (bagData) {
        // NOTE: check condition disable on check branchIdNext
        // status bagItemStatusIdLast ??
        const notScan =  bagData.bagItemStatusIdLast != BAG_STATUS.DO_HUB ? true : false;
        // Add Locking setnx redis
        const holdRedis = await RedisService.locking(
          `hold:dropoff:${bagData.bagItemId}`,
          'locking',
        );
        if (notScan && holdRedis) {
          // validate scan branch ??
          const notScanBranch = bagData.branchIdNext != permissonPayload.branchId ? true : false;
          // create bag trouble ==========================
          if (
            bagData.bagItemStatusIdLast != BAG_STATUS.OUT_BRANCH ||
            notScanBranch
          ) {
            const desc = notScanBranch ? 'Gerai tidak sesuai' : 'Status bag tidak sesuai';
            BagTroubleService.create(
              bagNumber,
              bagData.bagItemStatusIdLast,
              100, // IN HUB
              desc,
            );
          }
          // ==================================================================

          const bagItem = await BagItem.findOne({
            where: {
              bagItemId: bagData.bagItemId,
            },
          });
          if (bagItem) {
            // update status bagItem
            await BagItem.update({ bagItemId: bagItem.bagItemId }, {
              bagItemStatusIdLast: BAG_STATUS.DO_HUB,
              branchIdLast: permissonPayload.branchId,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            });

            // create data dropoff hub
            const dropoffHub = DropoffHub.create();
            dropoffHub.branchId = permissonPayload.branchId;
            dropoffHub.bagId = bagData.bag.bagId;
            dropoffHub.bagItemId = bagData.bagItemId;
            dropoffHub.bagNumber = bagNumber;
            await DropoffHub.save(dropoffHub);

            // NOTE: background job for insert bag item history
            BagItemHistoryQueueService.addData(
              bagData.bagItemId,
              BAG_STATUS.DO_HUB,
              permissonPayload.branchId,
              authMeta.userId,
            );

            // NOTE:
            // refactor send to background job for loop awb
            // update status DO_HUB (12600: drop off hub)
            BagDropoffHubQueueService.perform(
              dropoffHub.dropoffHubId,
              bagData.bagItemId,
              authMeta.userId,
              permissonPayload.branchId,
            );

            // update first scan in do pod =====================================
            // TODO: need refactoring code
            const doPodDetailBag = await DoPodDetailBagRepository.getDataByBagItemIdAndBagStatus(
              bagData.bagItemId,
              BAG_STATUS.DO_HUB,
            );
            if (doPodDetailBag) {
              // counter total scan in
              doPodDetailBag.doPod.totalScanInBag += 1;
              if (doPodDetailBag.doPod.totalScanInBag == 1) {
                await DoPod.update({ doPodId: doPodDetailBag.doPodId }, {
                  firstDateScanIn: timeNow,
                  lastDateScanIn: timeNow,
                  totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
                  updatedTime: timeNow,
                  userIdUpdated: authMeta.userId,
                });
              } else {
                await DoPod.update({ doPodId: doPodDetailBag.doPodId }, {
                  lastDateScanIn: timeNow,
                  totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
                  updatedTime: timeNow,
                  userIdUpdated: authMeta.userId,
                });
              }
            }
            // =================================================================

            totalSuccess += 1;
          }
          // remove key holdRedis
          RedisService.del(`hold:dropoff:${bagData.bagItemId}`);
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Gabung paket ${bagNumber} Sudah di proses.`;
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

  static async scanInBaggingHub(payload: WebScanInBaggingVm): Promise<WebScanInBaggingResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInBaggingResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const baggingNumber of payload.baggingNumber) {
      const response = {
        status: 'ok',
        trouble: false,
        message: 'Success',
      };

      const baggingData = await Bagging.findOne({
        where: {
          baggingCode: baggingNumber,
          isDeleted: false,
        },
      });
      if (baggingData) {
        const holdRedisBagging = await RedisService.locking(
          `hold:dropoff:bagging:${baggingData.baggingId}`,
          'locking',
        );
        // NOTE: check condition disable on check branchIdNext
        // status bagItemStatusIdLast ??
        const rawQuery = `
            SELECT
              bg.bagging_code,
              bit.bag_item_id,
              bit.bag_item_status_id_last,
              bit.branch_id_next,
              b.bag_number,
              b.bag_id
            FROM bagging bg
            INNER JOIN bagging_item bi ON bg.bagging_id = bi.bagging_id AND bi.is_deleted = FALSE
            INNER JOIN bag_item bit ON bi.bag_item_id = bit.bag_item_id AND bit.is_deleted = FALSE
            INNER JOIN bag b ON bit.bag_id = b.bag_id AND b.is_deleted = FAlSE
            where
              bg.bagging_id = ${baggingData.baggingId} AND
              bg.is_deleted = FALSE;
          `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        for (const resultBag of resultDataBag) {
          const notScan =  resultBag.bag_item_status_id_last != BAG_STATUS.DO_HUB ? true : false;
          // Add Locking setnx redis
          const holdRedis = await RedisService.locking(
            `hold:dropoff:${resultBag.bag_item_id}`,
            'locking',
          );
          if (notScan && holdRedis) {
            // validate scan branch ??
            const notScanBranch = resultBag.brach_id_next != permissonPayload.branchId ? true : false;
            // create bag trouble ==========================
            if (
              resultBag.bag_item_status_id_last != BAG_STATUS.OUT_BRANCH ||
              notScanBranch
            ) {
              const desc = notScanBranch ? 'Gerai tidak sesuai' : 'Status bag tidak sesuai';
              BagTroubleService.create(
                resultBag.bag_number,
                resultBag.bag_item_status_id_last,
                100, // IN HUB
                desc,
              );
            }
            // ==================================================================

            const bagItem = await BagItem.findOne({
              where: {
                bagItemId: resultBag.bag_item_id,
              },
            });
            if (bagItem) {
              // update status bagItem
              await BagItem.update({ bagItemId: bagItem.bagItemId }, {
                bagItemStatusIdLast: BAG_STATUS.DO_HUB,
                branchIdLast: permissonPayload.branchId,
                updatedTime: timeNow,
                userIdUpdated: authMeta.userId,
              });

              // create data dropoff hub
              const dropoffHubBagging = DropoffHubBagging.create();
              dropoffHubBagging.branchId = permissonPayload.branchId;
              dropoffHubBagging.baggingId = Number(baggingData.baggingId);
              dropoffHubBagging.bagId = resultBag.bag_id;
              dropoffHubBagging.bagItemId = resultBag.bag_item_id;
              dropoffHubBagging.bagNumber = resultBag.bag_number;
              await DropoffHubBagging.save(dropoffHubBagging);

              // NOTE: background job for insert bag item history
              BagItemHistoryQueueService.addData(
                resultBag.bag_item_id,
                BAG_STATUS.DO_HUB,
                permissonPayload.branchId,
                authMeta.userId,
              );

              // NOTE:
              // refactor send to background job for loop awb
              // update status DO_HUB (12600: drop off hub)
              BaggingDropoffHubQueueService.perform(
                dropoffHubBagging.dropoffHubBaggingId,
                resultBag.bag_item_id,
                authMeta.userId,
                permissonPayload.branchId,
              );

              totalSuccess += 1;
            }
            // remove key holdRedis
            RedisService.del(`hold:dropoff:${resultBag.bag_item_id}`);
          }
          // else {
          //   totalError += 1;
          //   response.status = 'error';
          //   response.message = `Gabung paket ${bagNumber} Sudah di proses.`;
          // }
        }
        RedisService.del(`hold:dropoff:bagging:${baggingData.baggingId}`);
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Bagging ${baggingNumber} Tidak di Temukan`;
      }
      // push item
      dataItem.push({
        baggingNumber,
        ...response,
      });
    } // end of loop

    result.totalData = payload.baggingNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

}
