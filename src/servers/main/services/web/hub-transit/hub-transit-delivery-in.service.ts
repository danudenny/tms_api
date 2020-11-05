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
import { WebDropOffSummaryListResponseVm, WebScanInHubSortListResponseVm } from '../../../models/web-scanin-list.response.vm';
import { MetaService } from '../../../../../shared/services/meta.service';
import { WebDeliveryListResponseVm } from '../../../models/web-delivery-list-response.vm';

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
        const BAG_STATUS_DO_SELECTED = (payload.hubId === 0) ? BAG_STATUS.DO_HUB : BAG_STATUS.DO_LINE_HAUL;
        const notScan = bagData.bagItemStatusIdLast != BAG_STATUS_DO_SELECTED ? true : false;
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
              bagItemStatusIdLast: BAG_STATUS_DO_SELECTED,
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
            dropoffHub.isSmd = payload.hubId;
            await DropoffHub.save(dropoffHub);

            // NOTE: background job for insert bag item history
            BagItemHistoryQueueService.addData(
              bagData.bagItemId,
              BAG_STATUS_DO_SELECTED,
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
              BAG_STATUS_DO_SELECTED,
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

  static async getDropOffList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInHubSortListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchIdScan'] = 't1.branch_id';
    payload.fieldResolverMap['branchIdFrom'] = 't2.branch_id';
    payload.fieldResolverMap['representativeFrom'] = 't2.ref_representative_code';
    payload.fieldResolverMap['bagNumber'] = 't2.bag_number';
    payload.fieldResolverMap['bagSeq'] = 't3.bag_seq';
    payload.fieldResolverMap['branchScanName'] = 't6.branch_name';
    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'createdTime',
      },
      {
        field: 'bagNumberCode',
      },
    ];

    const repo = new OrionRepositoryService(DropoffHub, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [
        `CONCAT(t2.bag_number, LPAD(t3.bag_seq::text, 3, '0'))`,
        'bagNumberCode',
      ],
      ['t2.bag_number', 'bagNumber'],
      ['t2.ref_representative_code', 'representativeCode'],
      ['t3.bag_seq', 'bagSeq'],
      ['t1.created_time', 'createdTime'],
      ['t1.dropoff_hub_id', 'dropoffHubId'],
      ['t5.branch_name', 'branchName'],
      ['t6.branch_name', 'branchScanName'],
      ['COUNT (t4.*)', 'totalAwb'],
      [`CONCAT(CAST(t3.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
    );

    q.innerJoin(e => e.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.dropoffHubDetails, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bag.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(`
      t1.created_time,
      t1.dropoff_hub_id,
      t3.bag_seq,
      t2.bag_number,
      t2.ref_representative_code,
      t3.weight,
      t5.branch_name,
      t6.branch_name
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInHubSortListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDropOffListDetail(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['dropOffHubId'] = 't1.dropoff_hub_id';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'dropOffHubId',
      },
    ];

    const repo = new OrionRepositoryService(DropoffHubDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t2.awb_number', 'awbNumber'],
      ['t3.consignee_name', 'consigneeName'],
      ['t3.consignee_address', 'consigneeAddress'],
      ['t4.district_name', 'districtName'],
    );

    q.innerJoin(e => e.awbItemAttr, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb.districtTo, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDropOffSummaryList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDropOffSummaryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    payload.fieldResolverMap['branchIdFrom'] = 't2.branch_id';
    payload.fieldResolverMap['representativeFrom'] = 't2.ref_representative_code';
    payload.fieldResolverMap['bagNumber'] = 't2.bag_number';
    payload.fieldResolverMap['bagSeq'] = 't3.bag_seq';

    const repo = new OrionRepositoryService(DropoffHub, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(['count(t4.awb_number)', 'totalResi']);
    q.innerJoin(e => e.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.dropoffHubDetails, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bag.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();

    const result = new WebDropOffSummaryListResponseVm();
    result.data = data;

    return result;
  }
}
