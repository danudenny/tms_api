import { AuthService } from '../../../../../shared/services/auth.service';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { RedisService } from '../../../../../shared/services/redis.service';
import { WebScanInBagResponseVm } from '../../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../../models/web-scanin-bag.vm';
import moment = require('moment');
import { BagService } from '../../v1/bag.service';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';
import { BagTroubleService } from '../../../../../shared/services/bag-trouble.service';
import { DoPodDetailBagRepository } from '../../../../../shared/orm-repository/do-pod-detail-bag.repository';
import { DoPod } from '../../../../../shared/orm-entity/do-pod';
import { BagItemHistoryQueueService } from '../../../../queue/services/bag-item-history-queue.service';
import { DropoffHub } from '../../../../../shared/orm-entity/dropoff_hub';
import { BagDropoffHubQueueService } from '../../../../queue/services/bag-dropoff-hub-queue.service';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { DropoffHubDetail } from '../../../../../shared/orm-entity/dropoff_hub_detail';
import { WebDropOffSummaryListResponseVm } from '../../../models/web-scanin-list.response.vm';
import { MetaService } from '../../../../../shared/services/meta.service';

export class HubTransitDeliveryInService {

  /**
   * scan dropoff_hub
   *
   * @static
   * @param {WebScanInBagVm} payload
   * @returns {Promise<WebScanInBagResponseVm>}
   * @memberof HubTransitDeliveryInService
   */
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
            await BagItem.update(bagItem.bagItemId, {
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
                await DoPod.update(doPodDetailBag.doPodId, {
                  firstDateScanIn: timeNow,
                  lastDateScanIn: timeNow,
                  totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
                  updatedTime: timeNow,
                  userIdUpdated: authMeta.userId,
                });
              } else {
                await DoPod.update(doPodDetailBag.doPodId, {
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

  static async getDropOffSummaryList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDropOffSummaryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchName'] = 't2.branch_name';

    if (payload.sortBy === '') {
      payload.sortBy = 'branchName';
    }

    const repo = new OrionRepositoryService(DropoffHubDetail, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['count(t1.branch_id)', 'totalResi'],
      ['t2.branch_name', 'branchName'],
      ['DATE(t1.created_time)', 'dateDropOff'],
    );

    q.innerJoin(e => e.branch, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    // q.whereRaw(
    //   `t1.created_time >= '2020-04-01' AND t1.created_time < '2020-04-21'`,
    // );
    q.groupByRaw(`t1.branch_id, t2.branch_name, "dateDropOff"`);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDropOffSummaryListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
