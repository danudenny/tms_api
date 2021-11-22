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
import { QueryServiceApi } from '../../../../../shared/services/query.service.api';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { DropoffHubDetail } from '../../../../../shared/orm-entity/dropoff_hub_detail';
import { WebDropOffSummaryListResponseVm, WebScanInHubSortListResponseVm } from '../../../models/web-scanin-list.response.vm';
import { MetaService } from '../../../../../shared/services/meta.service';
import { WebDeliveryListResponseVm } from '../../../models/web-delivery-list-response.vm';
import { BagItemHistory } from '../../../../../shared/orm-entity/bag-item-history';
import { getManager, In } from 'typeorm';
const uuidv1 = require('uuid/v1');
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

    const hubBagItemIds = [];
    const haulBagItemIds = [];
    const dropoffHubArr = [];
    const paramsBullHub = [];
    const paramsBullHaul = [];
    const paramsBull2 = [];
    const firstDoPodDetailBags = [];
    const doPodDetailBags = [];
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
        // const notScan = bagData.bagItemStatusIdLast != BAG_STATUS_DO_SELECTED ? true : false;
        const bagHistory = await BagItemHistory.findOne({
          where: {
            bagItemId: bagData.bagItemId,
            isDeleted: false,
            branchId: permissonPayload.branchId,
            bagItemStatusId: BAG_STATUS_DO_SELECTED,
          },
        });
        const notScan = bagHistory ? false : true;
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

          // update status bagItem
          if (payload.hubId === 0) {
            hubBagItemIds.push(bagData.bagItemId);
            paramsBullHub.push({ bagItemId: bagData.bagItemId });
          } else {
            haulBagItemIds.push(bagData.bagItemId);
            paramsBullHaul.push({ bagItemId: bagData.bagItemId });
          }

          // await BagItem.update({ bagItemId: bagData.bagItemId }, {
          //   bagItemStatusIdLast: BAG_STATUS_DO_SELECTED,
          //   branchIdLast: permissonPayload.branchId,
          //   updatedTime: timeNow,
          //   userIdUpdated: authMeta.userId,
          // });

          // create data dropoff hub

          const uuidString = uuidv1();
          const dropoffHub = DropoffHub.create();
          dropoffHub.dropoffHubId = uuidString;
          dropoffHub.branchId = permissonPayload.branchId;
          dropoffHub.bagId = bagData.bag.bagId;
          dropoffHub.bagItemId = bagData.bagItemId;
          dropoffHub.bagNumber = bagNumber;
          dropoffHub.isSmd = payload.hubId;
          dropoffHubArr.push(dropoffHub);

         // await DropoffHub.save(dropoffHub);

          // NOTE: background job for insert bag item history

          // BagItemHistoryQueueService.addData(
          //   bagData.bagItemId,
          //   BAG_STATUS_DO_SELECTED,
          //   permissonPayload.branchId,
          //   authMeta.userId,
          // );

          // NOTE:
          // refactor send to background job for loop awb
          // update status DO_HUB (12600: drop off hub)
          // console.log('### HUB TRANSIT DELIVERY SERVICE DROP OFF HUB QUEUE');
          // console.log('### HUB TRANSIT DELIVERY SERVICE dropoffHub =========', dropoffHub);
          // console.log('### HUB TRANSIT DELIVERY SERVICE bagData =========', bagData);
          // console.log('### HUB TRANSIT DELIVERY SERVICE bagItem =========', bagData);
          // console.log('### HUB TRANSIT DELIVERY SERVICE isSmd =========', payload.hubId);
          // console.log('### HUB TRANSIT DELIVERY SERVICE userId =========', authMeta.userId);

          paramsBull2.push({
            dropoffHubId: dropoffHub.dropoffHubId,
            bagItemId: bagData.bagItemId,
            bagId: bagData.bag.bagId,
            isSortir: bagData.isSortir,
          });

          // BagDropoffHubQueueService.perform(
          //   dropoffHub.dropoffHubId,
          //   bagData.bagItemId,
          //   authMeta.userId,
          //   permissonPayload.branchId,
          //   payload.hubId,
          //   bagData.bag.bagId,
          //   bagData.isSortir,
          // );
          // console.log('### HUB TRANSIT DELIVERY SERVICE END DROP OFF HUB QUEUE');

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
              // await DoPod.update({ doPodId: doPodDetailBag.doPodId }, {
              //   firstDateScanIn: timeNow,
              //   lastDateScanIn: timeNow,
              //   totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
              //   updatedTime: timeNow,
              //   userIdUpdated: authMeta.userId,
              // });
              firstDoPodDetailBags.push(doPodDetailBag.doPodId);
            } else {
              // await DoPod.update({ doPodId: doPodDetailBag.doPodId }, {
              //   lastDateScanIn: timeNow,
              //   totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
              //   updatedTime: timeNow,
              //   userIdUpdated: authMeta.userId,
              // });
              doPodDetailBags.push(doPodDetailBag.doPodId);
            }
          }
          // =================================================================

          totalSuccess += 1;

          // remove key holdRedis
          RedisService.del(`hold:dropoff:${bagData.bagItemId}`);
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Gabung paket ${bagNumber} Sudah discan di ${payload.hubId ? 'Line Haul' : 'Hub'}.`;
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

    // transaction
    if (totalSuccess > 0) {
      await getManager().transaction(async transactional => {
        // update hub
        if (hubBagItemIds.length) {
          await transactional.update(
            BagItem,
            { bagItemId: In(hubBagItemIds) },
            {
              bagItemStatusIdLast: BAG_STATUS.DO_HUB,
              branchIdLast: permissonPayload.branchId,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            },
          );
        }
        // update line haul
        if (haulBagItemIds.length) {
          await transactional.update(
            BagItem,
            { bagItemId: In(haulBagItemIds) },
            {
              bagItemStatusIdLast: BAG_STATUS.DO_LINE_HAUL,
              branchIdLast: permissonPayload.branchId,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            },
          );
        }
        // insert DropoffHub
        await transactional.insert(DropoffHub, dropoffHubArr);

        // update data
        if (firstDoPodDetailBags.length) {
          await transactional.update(
            DoPod,
            { doPodId: In(firstDoPodDetailBags) },
            {
              firstDateScanIn: timeNow,
              lastDateScanIn: timeNow,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            },
          );
        }

        if (doPodDetailBags.length) {
          await transactional.update(DoPod, { doPodId: In(doPodDetailBags) }, {
            lastDateScanIn: timeNow,
            updatedTime: timeNow,
            userIdUpdated: authMeta.userId,
          });
        }

      }); // end transaction

      // send bull 1
      if (hubBagItemIds.length) {
        for (const item of paramsBullHub) {
          BagItemHistoryQueueService.addData(
            item.bagItemId,
            BAG_STATUS.DO_HUB,
            permissonPayload.branchId,
            authMeta.userId,
          );
        }
      }

      if (haulBagItemIds.length) {
        for (const item of paramsBullHaul) {
          BagItemHistoryQueueService.addData(
            item.bagItemId,
            BAG_STATUS.DO_LINE_HAUL,
            permissonPayload.branchId,
            authMeta.userId,
          );
        }
      }

      // send data bull 2
      for (const item of paramsBull2) {
        BagDropoffHubQueueService.perform(
          item.dropoffHubId,
          item.bagItemId,
          authMeta.userId,
          permissonPayload.branchId,
          payload.hubId,
          item.bagId,
          item.isSortir,
        );
      }
    }

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
    payload.fieldResolverMap['bagNumberCode'] = '"bagNumberCode"';
    payload.fieldResolverMap['bagSeq'] = 't3.bag_seq';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['branchScanName'] = 't6.branch_name';
    payload.fieldResolverMap['isSmd'] = 't1.is_smd';
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
      [`DISTINCT t2.bag_number||LPAD(t3.bag_seq::text, 3, '0')`,'bagNumberCode'],
      ['t2.bag_number', 'bagNumber'],
      ['t2.ref_representative_code', 'representativeCode'],
      ['t3.bag_seq', 'bagSeq'],
      ['t1.created_time', 'createdTime'],
      ['t1.dropoff_hub_id', 'dropoffHubId'],
      ['t5.branch_name', 'branchName'],
      ['t6.branch_name', 'branchScanName'],
      [`CAST("t3"."weight" AS NUMERIC(20,2))||' Kg'`, 'weight'],
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

    const query = await q.getQuery();
    let data = await QueryServiceApi.executeQuery(query, false, null);

    const result = new WebScanInHubSortListResponseVm();
    for(let i = 0; i < data.length; i++){
      const repoDetail = new OrionRepositoryService(DropoffHubDetail, 't1');
      const qDetail = repoDetail.findAllRaw();
      qDetail.andWhere(e => e.dropoffHubId, w => w.equals(data[i].dropoffhubid));
      let queryDetail = qDetail.getQuery();
      const dataDetail = await QueryServiceApi.executeQuery(queryDetail, false, null);
      
      data[i].totalAwb = dataDetail.length;
      data[i].bagNumberCode = data[i].bagnumbercode;
      data[i].bagNumber = data[i].bagnumber;
      data[i].representativeCode = data[i].representativecode;
      data[i].bagSeq = data[i].bagseq;
      data[i].createdTime = data[i].createdtime;
      data[i].dropoffHubId = data[i].dropoffhubid;
      data[i].branchName = data[i].branchname;
      data[i].branchScanName = data[i].branchscanname;
      data[i].weight = data[i].weight;
    }

    const repoCount = new OrionRepositoryService(DropoffHub, 't1');
    const qCount = repoCount.findAllRaw();

    payload.applyToOrionRepositoryQuery(qCount, false);
    qCount.selectRaw(
      [`DISTINCT t2.bag_number||LPAD(t3.bag_seq::text, 3, '0')`,'bagNumberCode'],
      ['t2.bag_number', 'bagNumber'],
      ['t2.ref_representative_code', 'representativeCode'],
      ['t3.bag_seq', 'bagSeq'],
      ['t1.created_time', 'createdTime'],
      ['t1.dropoff_hub_id', 'dropoffHubId'],
      ['t5.branch_name', 'branchName'],
      ['t6.branch_name', 'branchScanName'],
      [`CAST("t3"."weight" AS NUMERIC(20,2))||' Kg'`, 'weight'],
    );

    qCount.innerJoin(e => e.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    qCount.innerJoin(e => e.bagItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    qCount.innerJoin(e => e.dropoffHubDetails, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    qCount.innerJoin(e => e.bag.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    qCount.innerJoin(e => e.branch, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    let queryCount = await qCount.getQuery();
    let cnt =  await QueryServiceApi.executeQuery(queryCount, true, 'bagnumbercode');
    const total = cnt;
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

    const query = await q.getQuery();
    let data = await QueryServiceApi.executeQuery(query, false, null);

    for(let i = 0; i < data.length; i++){
      data[i].awbNumber = data[i].awbnumber;
      data[i].consigneeName = data[i].consigneename;
      data[i].consigneeAddress = data[i].consigneeaddress;
      data[i].districtName = data[i].districtname;
    }

    const result = new WebDeliveryListResponseVm();

    const repoCount = new OrionRepositoryService(DropoffHubDetail, 't1');
    const qCount = repoCount.findAllRaw();

    payload.applyToOrionRepositoryQuery(qCount, false);

    qCount.selectRaw(
      ['t2.awb_number', 'awbNumber'],
      ['t3.consignee_name', 'consigneeName'],
      ['t3.consignee_address', 'consigneeAddress'],
      ['t4.district_name', 'districtName'],
    );

    qCount.innerJoin(e => e.awbItemAttr, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    qCount.innerJoin(e => e.awb, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    qCount.innerJoin(e => e.awb.districtTo, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    let queryCount = await qCount.getQuery();
    let cnt =  await QueryServiceApi.executeQuery(queryCount, true, 'awbnumber');
    const total = cnt;

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
    payload.fieldResolverMap['isSmd'] = 't1.is_smd';

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

    let query = await q.getQuery();
    let data = await QueryServiceApi.executeQuery(query, false, null);
    for(let i = 0; i < data.length; i++){
      data[i].totalResi = data[i].totalresi;
    }

    const result = new WebDropOffSummaryListResponseVm();
    result.data = data;

    return result;
  }
}
