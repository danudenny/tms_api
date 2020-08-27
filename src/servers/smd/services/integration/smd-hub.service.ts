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
import { WebScanInBaggingVm, WebScanInBagRepresentativeVm } from '../../models/scanin-hub-smd.payload.vm';
import { WebScanInBaggingResponseVm, WebScanInBagRepresentativeResponseVm, WebScanInHubBagRepresentativeSortListResponseVm, WebScanInHubBagRepresentativeDetailSortListResponseVm, SmdHubBaggingListResponseVm, SmdHubBaggingDetailResponseVm } from '../../models/scanin-hub-smd.response.vm';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { DropoffHubBagging } from '../../../../shared/orm-entity/dropoff_hub_bagging';
import { BaggingDropoffHubQueueService } from '../../../queue/services/bagging-dropoff-hub-queue.service';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { BAG_REPRESENTATIVE_STATUS } from '../../../../shared/constants/bag-representative-status.constant';
import { DropoffHubBagRepresentative } from '../../../../shared/orm-entity/dropoff_hub_bag_representative';
import { BagRepresentativeDropoffHubQueueService } from '../../../queue/services/bag-representative-dropoff-hub-queue.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { DropoffHubDetailBagRepresentative } from '../../../../shared/orm-entity/dropoff_hub_detail_bag_representative';
import { DropoffHubDetailBagging } from '../../../../shared/orm-entity/dropoff_hub_detail_bagging';
import { BagRepresentativeHistory } from '../../../../shared/orm-entity/bag-representative-history';
import { SmdHubDropOffGabPaketListResponseVm, SmdHubDropOffGabPaketAwbListResponseVm } from '../../models/smd-hub-drop-off-bagging.response.vm';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';

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
    let totalErrorDetail = 0;

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
        const dropoffHubBaggingData = await DropoffHubBagging.findOne({
          where: {
            baggingId: baggingData.baggingId,
            branchId: permissonPayload.branchId,
            isDeleted: false,
          },
        });
        if (dropoffHubBaggingData) {
          totalError += 1;
          response.status = 'failed';
          response.message = `Bagging ${baggingNumber} Sudah Pernah di Scan di branch ini`;
        } else {
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
          if (resultDataBag) {
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
              } else {
                totalErrorDetail += 1;
                if (totalErrorDetail == resultDataBag.length) {
                  totalError += 1;
                  response.status = 'error';
                  response.message = `Bagging ${baggingNumber} , Semua Gab.Paket Telah distatus DO HUB.`;
                }
              }
            }
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Detail Bagging ${baggingNumber} Tidak di Temukan`;
          }
          RedisService.del(`hold:dropoff:bagging:${baggingData.baggingId}`);
        }
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

  static async scanInBagRepresentativeHub(payload: WebScanInBagRepresentativeVm): Promise<WebScanInBagRepresentativeResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInBagRepresentativeResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const bagRepresentativeNumber of payload.bagRepresentativeNumber) {
      const response = {
        status: 'ok',
        trouble: false,
        message: 'Success',
      };

      const bagRepresentativeData = await BagRepresentative.findOne({
        where: {
          bagRepresentativeCode: bagRepresentativeNumber,
          isDeleted: false,
        },
      });
      if (bagRepresentativeData) {
        const holdRedis = await RedisService.locking(
          `hold:dropoff:bagrepresentative:${bagRepresentativeData.bagRepresentativeId}`,
          'locking',
        );
        // NOTE: check condition disable on check branchIdNext
        // status bagItemStatusIdLast ??
        const notScan =  bagRepresentativeData.bagRepresentativeStatusIdLast != BAG_REPRESENTATIVE_STATUS.DO_HUB ? true : false;

        if (notScan && holdRedis) {
          // update status bagRepresentative
          await BagRepresentative.update({ bagRepresentativeId: bagRepresentativeData.bagRepresentativeId }, {
            bagRepresentativeStatusIdLast: BAG_REPRESENTATIVE_STATUS.DO_HUB,
            updatedTime: timeNow,
            userIdUpdated: authMeta.userId,
          });

          const historyBagRepresentative = BagRepresentativeHistory.create();
          historyBagRepresentative.bagRepresentativeCode = bagRepresentativeData.bagRepresentativeCode;
          historyBagRepresentative.bagRepresentativeDate = moment(bagRepresentativeData.bagRepresentativeDate).toDate();
          historyBagRepresentative.bagRepresentativeId = bagRepresentativeData.bagRepresentativeId.toString();
          historyBagRepresentative.bagRepresentativeStatusIdLast = '3500';
          historyBagRepresentative.branchId = permissonPayload.branchId.toString();
          historyBagRepresentative.representativeIdTo = bagRepresentativeData.representativeIdTo;
          historyBagRepresentative.totalItem = bagRepresentativeData.totalItem;
          historyBagRepresentative.totalWeight = bagRepresentativeData.totalWeight.toString();
          historyBagRepresentative.userIdCreated = authMeta.userId.toString();
          historyBagRepresentative.createdTime = moment().toDate();
          historyBagRepresentative.userIdUpdated = authMeta.userId.toString();
          historyBagRepresentative.updatedTime = moment().toDate();
          await BagRepresentativeHistory.insert(historyBagRepresentative);

          // create data dropoff hub
          const dropoffHubBagRepresentative = DropoffHubBagRepresentative.create();
          dropoffHubBagRepresentative.branchId = permissonPayload.branchId;
          dropoffHubBagRepresentative.bagRepresentativeId = bagRepresentativeData.bagRepresentativeId;
          dropoffHubBagRepresentative.bagRepresentativeCode = bagRepresentativeData.bagRepresentativeCode;
          await DropoffHubBagRepresentative.save(dropoffHubBagRepresentative);

          // NOTE:
          // refactor send to background job for loop awb
          // update status DO_HUB (12600: drop off hub)
          BagRepresentativeDropoffHubQueueService.perform(
            dropoffHubBagRepresentative.dropoffHubBagRepresentativeId,
            bagRepresentativeData.bagRepresentativeId,
            authMeta.userId,
            permissonPayload.branchId,
          );

          totalSuccess += 1;
          // remove key holdRedis
          RedisService.del(`hold:dropoff:bagrepresentative:${bagRepresentativeData.bagRepresentativeId}`);
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Gabung Sortir Kota ${bagRepresentativeNumber} Sudah di proses.`;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Gabung Sortir Kota ${bagRepresentativeNumber} Tidak di Temukan`;
      }
      // push item
      dataItem.push({
        bagRepresentativeNumber,
        ...response,
      });
    } // end of loop

    result.totalData = payload.bagRepresentativeNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  static async getDropOffBagRepresentativeList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInHubBagRepresentativeSortListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 'e.created_time';
    payload.fieldResolverMap['dropoffHubBagRepresentativeId'] = 'e.dropoff_hub_bag_representative_id';
    payload.fieldResolverMap['branchIdScan'] = 'b.branch_id';
    payload.fieldResolverMap['branchNameScan'] = 'b.branch_name';
    payload.fieldResolverMap['branchNameFrom'] = 'b2.branch_name';
    payload.fieldResolverMap['totalAwb'] = 'br.total_item';
    payload.fieldResolverMap['weight'] = 'br.total_weight';
    payload.fieldResolverMap['branchIdFrom'] = 'b2.branch_id';
    payload.fieldResolverMap['representativeFrom'] = 'r.representative_code';
    payload.fieldResolverMap['bagRepresentativeCode'] = 'br.bag_representative_code';
    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'createdTime',
      },
      {
        field: 'bagRepresentativeCode',
      },
    ];

    const repo = new OrionRepositoryService(DropoffHubBagRepresentative, 'e');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['e.dropoff_hub_bag_representative_id', 'dropoffHubBagRepresentativeId'],
      [`br.bag_representative_code`, 'bagRepresentativeCode'],
      ['e.created_time', 'createdTime'],
      ['r.representative_code', 'representativeFrom'],
      ['b.branch_id', 'branchIdScan'],
      ['b.branch_name', 'branchNameScan'],
      ['b2.branch_id', 'branchIdFrom'],
      ['b2.branch_name', 'branchNameFrom'],
      ['br.total_item', 'totalAwb'],
      [`CONCAT(CAST(br.total_weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
    );

    q.innerJoinRaw(
      'bag_representative',
      'br',
      'e.bag_representative_id = br.bag_representative_id and br.is_deleted = false',
    );
    q.leftJoinRaw(
      'representative',
      'r',
      'br.representative_id_to = r.representative_id and r.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'b',
      'e.branch_id = b.branch_id and b.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'b2',
      'br.branch_id = b2.branch_id  and b2.is_deleted = false',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInHubBagRepresentativeSortListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDropOffBagRepresentativeDetailList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInHubBagRepresentativeDetailSortListResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['dropOffHubBagRepresentativeId'] = 't1.dropoff_hub_bag_representative_id';
    payload.fieldResolverMap['consigneeName'] = 't3.consignee_name';
    payload.fieldResolverMap['consigneeAddress'] = 't3.consignee_address';
    payload.fieldResolverMap['districtName'] = 't4.district_name';
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'dropOffHubBagRepresentativeId',
      },
    ];

    const repo = new OrionRepositoryService(DropoffHubDetailBagRepresentative, 't1');
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

    const result = new WebScanInHubBagRepresentativeDetailSortListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDropOffListBagging(
    payload: BaseMetaPayloadVm,
  ): Promise<SmdHubBaggingListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchIdScan'] = 't1.branch_id';
    payload.fieldResolverMap['branchIdFrom'] = 't2.branch_id';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['branchScanName'] = 't6.branch_name';
    payload.fieldResolverMap['representativeFrom'] = 't7.representative_code';
    payload.fieldResolverMap['representativeCode'] = 't7.representative_code';
    payload.fieldResolverMap['baggingCode'] = 't2.bagging_code';
    payload.fieldResolverMap['totalAwb'] = 't2.total_item';
    payload.fieldResolverMap['dropoffHubBaggingId'] = 't2.dropoff_hub_bagging_id';
    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'createdTime',
      },
      {
        field: 'representativeCode',
      },
    ];

    const repo = new OrionRepositoryService(Bagging, 't2');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`t2.bagging_id`, 'baggingId'],
      [`t2.bagging_code`, 'baggingCode'],
      ['t7.representative_code', 'representativeCode'],
      ['t1.created_time', 'createdTime'],
      ['t1.dropoff_hub_bagging_id', 'dropoffHubBaggingId'],
      ['t5.branch_name', 'branchName'],
      ['t6.branch_name', 'branchScanName'],
      ['t2.total_item', 'totalAwb'],
      [`CONCAT(t2.total_weight,' Kg')`, 'weight'],
    );

    q.innerJoinRaw(
      `(
        SELECT
          dhb.bagging_id,
          dhb.created_time,
          dhb.dropoff_hub_bagging_id,
          dhb.branch_id,
          RANK () OVER (PARTITION BY bagging_id ORDER BY dropoff_hub_bagging_id DESC) AS rank
        FROM dropoff_hub_bagging dhb
      )`,
      't1',
      't1.bagging_id = t2.bagging_id',
    );
    q.innerJoin(e => e.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.dropoffHubBagging.branch, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.representative, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhereRaw('t1.rank = 1');
    q.groupByRaw(`
      t1.dropoff_hub_bagging_id,
      t2.bagging_id,
      t2.bagging_code,
      t7.representative_code,
      t1.created_time,
      t5.branch_name,
      t6.branch_name,
      t2.total_weight,
      t2.total_item
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new SmdHubBaggingListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDropOffHubBaggingListDetail(
    payload: BaseMetaPayloadVm,
  ): Promise<SmdHubBaggingDetailResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['dropOffHubBaggingId'] = 't1.dropoff_hub_bagging_id';
    payload.fieldResolverMap['consigneeName'] = 't3.consignee_name';
    payload.fieldResolverMap['consigneeAddress'] = 't3.consignee_address';
    payload.fieldResolverMap['districtName'] = 't4.district_name';
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'dropOffHubBaggingId',
      },
    ];

    const repo = new OrionRepositoryService(DropoffHubDetailBagging, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.dropoff_hub_bagging_id', 'dropOffHubBaggingId'],
      ['t1.awb_number', 'awbNumber'],
      ['t3.consignee_name', 'consigneeName'],
      ['t3.consignee_address', 'consigneeAddress'],
      ['t4.district_name', 'districtName'],
    );

    q.innerJoin(e => e.awb, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb.districtTo, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new SmdHubBaggingDetailResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDropOffListGabPaketList(payload: BaseMetaPayloadVm): Promise<SmdHubDropOffGabPaketListResponseVm> {
    // mapping payload to field
    payload.fieldResolverMap['baggingId'] = 'b.bagging_id';
    payload.globalSearchFields = [
      { field: 'baggingId' },
    ];

    const repo = new OrionRepositoryService(BaggingItem, 'b').findAllRaw();

    payload.applyToOrionRepositoryQuery(repo, true);

    repo.innerJoin(i => i.bagItem, 'bi', j =>
      j.andWhere(w => w.isDeleted, v => v.isFalse()),
    )
    .innerJoin(i => i.bagItem.bag, 'bib', j =>
      j.andWhere(w => w.isDeleted, v => v.isFalse()),
    )
    .orderBy({ createdTime: 'DESC' })
    .andWhere(w => w.isDeleted, v => v.isFalse())
    .selectRaw(
      ['b.bagging_id', 'baggingId'],
      ['b.bagging_item_id', 'baggingItemId'],
      [`CONCAT(bib.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`, 'bagNumber'],
    );

    const data = await repo.exec();
    const totalData = await repo.countWithoutTakeAndSkip();

    const result = new SmdHubDropOffGabPaketListResponseVm();
    result.data = data;
    result.buildPagingWithPayload(payload, totalData);

    return result;
  }

  static async getDropOffListGabPaketAwbList(payload: BaseMetaPayloadVm): Promise<SmdHubDropOffGabPaketAwbListResponseVm> {
    payload.fieldResolverMap['baggingItemId'] = 'bi.bag_item_id';
    payload.globalSearchFields = [
      { field: 'baggingItemId' },
    ];

    const repo = new OrionRepositoryService(BagItemAwb, 'bia').findAllRaw();

    payload.applyToOrionRepositoryQuery(repo, true);

    repo.innerJoin(i => i.bagItem, 'bi', j =>
      j.andWhere(w => w.isDeleted, v => v.isFalse()),
    )
    .andWhere(w => w.isDeleted, v => v.isFalse())
    .selectRaw(
      ['bi.bag_item_id', 'baggingItemId'],
      ['bia.bag_item_awb_id', 'bagItemAwbId'],
      ['bia.awb_number', 'awbNumber'],
    );

    const data = await repo.exec();
    const totalData = await repo.countWithoutTakeAndSkip();

    const result = new SmdHubDropOffGabPaketAwbListResponseVm();
    result.data = data;
    result.buildPagingWithPayload(payload, totalData);

    return result;
  }
}
