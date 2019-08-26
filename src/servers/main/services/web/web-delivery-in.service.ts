// #region import
import { Injectable, Logger } from '@nestjs/common';
import moment = require('moment');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { DoPodDetail } from '../../../../shared/orm-entity/do-pod-detail';
import { PodScanIn } from '../../../../shared/orm-entity/pod-scan-in';
import { AuthService } from '../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { WebScanInAwbResponseVm, WebScanInBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInBagListResponseVm, WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInVm, WebScanInBranchVm, WebScanInBranchResponseVm, ScanInputNumberBranchVm } from '../../models/web-scanin.vm';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbTroubleService } from '../../../../shared/services/awb-trouble.service';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { Awb } from '../../../../shared/orm-entity/awb';
import { WebAwbFListPodResponseVm } from '../../models/web-awb-filter-list.response.vm';
// #endregion

@Injectable()
export class WebDeliveryInService {
  constructor() {}

  async findAllAwbByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInListResponseVm> {
    // mapping field
    payload.fieldResolverMap['podScaninDateTime'] = 't1.pod_scanin_date_time';
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['branchIdScan'] = 't3.branch_id';
    payload.fieldResolverMap['branchNameScan'] = 't3.branch_name';
    payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
    payload.fieldResolverMap['branchIdFrom'] = 't4.branch_id';
    payload.fieldResolverMap['employeeName'] = 't5.fullname';
    if (payload.sortBy === '') {
      payload.sortBy = 'podScaninDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'podScaninDateTime',
      },
    ];

    const repo = new OrionRepositoryService(PodScanIn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.pod_scanin_date_time', 'podScaninDateTime'],
      ['t2.awb_number', 'awbNumber'],
      ['t3.branch_name', 'branchNameScan'],
      ['t3.branch_code', 'branchCodeScan'],
      ['t4.branch_name', 'branchNameFrom'],
      ['t4.branch_code', 'branchCodeFrom'],
      ['t5.nickname', 'employeeName'],
    );

    q.innerJoin(e => e.awb_item_attr, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.do_pod_detail.doPod.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.employee, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async findAllBagByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInBagListResponseVm> {
    // mapping field
    payload.fieldResolverMap['podScaninDateTime'] = 't1.pod_scanin_date_time';
    payload.fieldResolverMap['bagNumber'] = 't2.bag_number';
    payload.fieldResolverMap['branchIdScan'] = 't3.branch_id';
    payload.fieldResolverMap['branchNameScan'] = 't3.branch_name';
    payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
    payload.fieldResolverMap['branchIdFrom'] = 't4.branch_id';
    payload.fieldResolverMap['employeeName'] = 't5.nickname';
    if (payload.sortBy === '') {
      payload.sortBy = 'podScaninDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'podScaninDateTime',
      },
    ];

    const repo = new OrionRepositoryService(PodScanIn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.pod_scanin_date_time', 'podScaninDateTime'],
      ['t6.bag_seq', 'bagSeq'],
      ['t2.bag_number', 'bagNumber'],
      [
        `CASE LENGTH (CAST(t6.bag_seq AS varchar(10)))
          WHEN 1 THEN
            CONCAT (t2.bag_number,'00',t6.bag_seq)
          WHEN 2 THEN
            CONCAT (t2.bag_number,'0',t6.bag_seq)
          ELSE
            CONCAT (t2.bag_number,t6.bag_seq) END`,
        'bagNumberCode',
      ],
      ['t3.branch_name', 'branchNameScan'],
      ['t4.branch_name', 'branchNameFrom'],
      ['t5.nickname', 'employeeName'],
      ['COUNT (t7.*)', 'totalAwb'],
    );

    q.innerJoin(e => e.bag_item, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bag_item.bagItemAwbs, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bag_item.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.do_pod_detail.doPod.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.user.employee, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(
      't1.pod_scanin_date_time, t2.bag_number, t3.branch_name, t4.branch_name, t5.nickname, t6.bag_seq',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInBagListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async findAllBagDetailByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['bagNumber'] = 't1.bag_number';
    payload.fieldResolverMap['bagSeq'] = 't3.bag_seq';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'bagNumber',
      },
      {
        field: 'bagSeq',
      },
    ];

    const repo = new OrionRepositoryService(Bag, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t2.awb_number', 'awbNumber'],
      [`CONCAT(CAST(t2.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
    );

    q.innerJoin(e => e.bagItems, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItems.bagItemAwbs, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  /**
   * Scan in Bag Number (Hub) - NewFlow
   * Flow Data : https://docs.google.com/document/d/1wnrYqlCmZruMMwgI9d-ko54JGQDWE9sn2yjSYhiAIrg/edit
   * @param {WebScanInBagVm} payload
   * @param {boolean} isHub
   * @returns {Promise<WebScanInBagResponseVm>}
   * @memberof WebDeliveryInService
   */
  async scanInBag(
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
          if (bagData.bagItemStatusIdLast == 1000) {
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
                // TODO: to be review
                const podScanIn = PodScanIn.create();
                podScanIn.scanInType = 'bag';
                podScanIn.employeeId = authMeta.employeeId;
                podScanIn.bagItemId = bagData.bagItemId;
                podScanIn.branchId = permissonPayload.branchId;
                podScanIn.userId = authMeta.userId;
                podScanIn.podScaninDateTime = timeNow;
                await PodScanIn.save(podScanIn);
                // update bagItem
                const bagItem = await BagItem.findOne({
                  where: {
                    bagItemId: bagData.bagItemId,
                  },
                });
                bagItem.bagItemStatusIdLast = 2000;
                bagItem.branchIdLast = permissonPayload.branchId;
                bagItem.updatedTime = timeNow;
                bagItem.userIdUpdated = authMeta.userId;
                BagItem.save(bagItem);

                // Update Data doPodDetail
                doPodDetail.podScanInId = podScanIn.podScanInId;
                doPodDetail.isScanIn = true;
                doPodDetail.updatedTime = timeNow;
                doPodDetail.userIdUpdated = authMeta.userId;
                await DoPodDetail.save(doPodDetail);

                const doPod = await DoPod.findOne({
                  where: {
                    doPodId: doPodDetail.doPodId,
                    isDeleted: false,
                  },
                });

                // counter total scan in
                doPod.totalScanIn = doPod.totalScanIn + 1;

                if (doPod.totalScanIn == 1) {
                  doPod.firstDateScanIn = timeNow;
                  doPod.lastDateScanIn = timeNow;
                } else {
                  doPod.lastDateScanIn = timeNow;
                }
                await DoPod.save(doPod);

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
                          doPod.branchIdTo,
                          AWB_STATUS.DO_HUB,
                        );
                        // NOTE: queue by Bull
                        DoPodDetailPostMetaQueueService.createJobByScanInBag(
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

                totalSuccess += 1;
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = `Gabung paket ${bagNumber} belum scan out di gerai sebelumnya`;
              }
              // #endregion after scanin

              // remove key holdRedis
              RedisService.del(`hold:bagscanin:${bagData.bagItemId}`);
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = 'Server Busy';
            }
          } else {
            totalSuccess += 1;
            response.message = `Gabung paket ${bagNumber} belum scan out di gerai sebelumnya`;
            if (bagData.bagItemStatusIdLast == 2000) {
              response.message = `Gabung paket ${bagNumber} sudah pernah scan in`;
            }
          }
        } else {
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

  /**
   * Scan in Awb Number (Branch) - NewFlow
   * Flow Data : https://docs.google.com/document/d/1wnrYqlCmZruMMwgI9d-ko54JGQDWE9sn2yjSYhiAIrg/edit
   * @param {WebScanInVm} payload
   * @returns {Promise<WebScanInAwbResponseVm>}
   * @memberof WebDeliveryInService
   */
  async scanInAwb(payload: WebScanInVm): Promise<WebScanInAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        trouble: false,
        message: 'Success',
      };

      const awb = await DeliveryService.validAwbNumber(awbNumber);
      if (awb) {
        const statusCode = await DeliveryService.awbStatusGroup(
          awb.awbStatusIdLast,
        );
        switch (statusCode) {
          case 'IN':
            if (awb.branchIdLast == permissonPayload.branchId) {
              // NOTE: Mau IN tapi udah IN di BRANCH SAMA = TROUBLE(PASS)
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah pernah scan ini`;
            } else {
              // TODO: construct data Awb Problem
              // Mau IN tapi udah IN di BRANCH LAIN = TROUBLE
              // Mau IN tapi belum OUT SAMA SEKALI = TROUBLE
              // save data to awb_trouble
              await AwbTroubleService.fromScanIn(
                awbNumber,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.trouble = true;
              response.message =
                `Resi ${awbNumber} belum scan out di gerai sebelumnya ` +
                `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'OUT':
            // NOTE: check condition disable on check branchIdNext
            // awb.branchIdNext == permissonPayload.branchId;
            if (permissonPayload.branchId) {
              // Add Locking setnx redis
              const holdRedis = await RedisService.locking(
                `hold:scanin:${awb.awbItemId}`,
                'locking',
              );
              if (holdRedis) {
                // save data to table pod_scan_id
                // TODO: to be review
                const podScanIn = PodScanIn.create();
                // podScanIn.awbId = ??;
                // podScanIn.doPodId = ??;
                podScanIn.scanInType = 'awb';
                podScanIn.employeeId = authMeta.employeeId;
                podScanIn.awbItemId = awb.awbItemId;
                podScanIn.branchId = permissonPayload.branchId;
                podScanIn.userId = authMeta.userId;
                podScanIn.podScaninDateTime = timeNow;
                await PodScanIn.save(podScanIn);

                // AFTER Scan IN ===============================================
                // #region after scanin
                const doPodDetail = await DoPodDetail.findOne({
                  where: {
                    awbItemId: awb.awbItemId,
                    isScanIn: false,
                    isDeleted: false,
                  },
                });
                if (doPodDetail) {
                  // Update Data doPodDetail
                  doPodDetail.podScanInId = podScanIn.podScanInId;
                  doPodDetail.isScanIn = true;
                  doPodDetail.updatedTime = timeNow;
                  doPodDetail.userIdUpdated = authMeta.userId;
                  await DoPodDetail.save(doPodDetail);

                  // Update do_pod dengan field
                  const doPod = await DoPod.findOne({
                    where: {
                      doPodId: doPodDetail.doPodId,
                      isDeleted: false,
                    },
                  });

                  // counter total scan in
                  doPod.totalScanIn = doPod.totalScanIn + 1;

                  if (doPod.totalScanIn == 1) {
                    doPod.firstDateScanIn = timeNow;
                    doPod.lastDateScanIn = timeNow;
                  } else {
                    doPod.lastDateScanIn = timeNow;
                  }
                  await DoPod.save(doPod);
                  await DeliveryService.updateAwbAttr(
                    awb.awbItemId,
                    doPod.branchIdTo,
                    AWB_STATUS.IN_BRANCH,
                  );

                  // NOTE: queue by Bull
                  DoPodDetailPostMetaQueueService.createJobByScanInAwb(
                    doPodDetail.doPodDetailId,
                  );
                  totalSuccess += 1;
                } else {
                  totalError += 1;
                  response.status = 'error';
                  response.message = `Resi ${awbNumber} belum di scan out`;
                }
                // #endregion after scanin

                // remove key holdRedis
                RedisService.del(`hold:scanin:${awb.awbItemId}`);
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = 'Server Busy';
              }
            } else {
              // save data to awb_trouble
              await AwbTroubleService.fromScanIn(
                awbNumber,
                awb.awbStatusIdLast,
              );
              totalError += 1;
              response.status = 'error';
              response.trouble = true;
              response.message =
                `Resi ${awbNumber} milik gerai ` +
                `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
            }
            break;

          default:
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} tidak dapat SCAN IN, Harap hubungi kantor pusat`;
            break;
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

  async scanInAwbBranch(payload: WebScanInVm): Promise<WebScanInAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        trouble: false,
        message: 'Success',
      };

      const awb = await DeliveryService.validAwbNumber(awbNumber);
      if (awb) {
        const statusCode = await DeliveryService.awbStatusGroup(
          awb.awbStatusIdLast,
        );
        switch (statusCode) {
          case 'IN':
            if (awb.branchIdLast == permissonPayload.branchId) {
              // NOTE: Mau IN tapi udah IN di BRANCH SAMA = TROUBLE(PASS)
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah pernah scan ini`;
            } else {
              // TODO: construct data Awb Problem
              // Mau IN tapi udah IN di BRANCH LAIN = TROUBLE
              // Mau IN tapi belum OUT SAMA SEKALI = TROUBLE
              // save data to awb_trouble
              await AwbTroubleService.fromScanIn(
                awbNumber,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.trouble = true;
              response.message =
                `Resi ${awbNumber} belum scan out di gerai sebelumnya ` +
                `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'OUT':
            // NOTE: check condition disable on check branchIdNext
            // awb.branchIdNext == permissonPayload.branchId;
            if (permissonPayload.branchId) {
              // Add Locking setnx redis
              const holdRedis = await RedisService.locking(
                `hold:scanin:${awb.awbItemId}`,
                'locking',
              );
              if (holdRedis) {
                // save data to table pod_scan_id
                // TODO: to be review
                const podScanIn = PodScanIn.create();
                // podScanIn.awbId = ??;
                // podScanIn.doPodId = ??;
                podScanIn.scanInType = 'awb';
                podScanIn.employeeId = authMeta.employeeId;
                podScanIn.awbItemId = awb.awbItemId;
                podScanIn.branchId = permissonPayload.branchId;
                podScanIn.userId = authMeta.userId;
                podScanIn.podScaninDateTime = timeNow;
                await PodScanIn.save(podScanIn);

                // AFTER Scan IN ===============================================
                // #region after scanin
                await DeliveryService.updateAwbAttr(
                  awb.awbItemId,
                  null,
                  AWB_STATUS.IN_BRANCH,
                );

                // NOTE: queue by Bull
                DoPodDetailPostMetaQueueService.createJobByScanInAwbBranch(
                  awb.awbItemId,
                  permissonPayload.branchId,
                  authMeta.userId,
                );
                totalSuccess += 1;
                // #endregion after scanin

                // remove key holdRedis
                RedisService.del(`hold:scanin:${awb.awbItemId}`);
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = 'Server Busy';
              }
            } else {
              // save data to awb_trouble
              await AwbTroubleService.fromScanIn(
                awbNumber,
                awb.awbStatusIdLast,
              );
              totalError += 1;
              response.status = 'error';
              response.trouble = true;
              response.message =
                `Resi ${awbNumber} milik gerai ` +
                `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
            }
            break;

          default:
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} tidak dapat SCAN IN, Harap hubungi kantor pusat`;
            break;
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

  async scanInBranch(
    payload: WebScanInBranchVm,
  ): Promise<WebScanInBranchResponseVm> {
    let totalSuccessAwb = 0;
    let totalSuccessBag = 0;
    let totalError = 0;
    const data: ScanInputNumberBranchVm[] = [];

    for (const inputNumber of payload.inputNumber) {
      const dataItem = await this.handleTypeNumber(inputNumber);
      if (dataItem.status == 'ok') {
        dataItem.isBag ? (totalSuccessBag += 1) : (totalSuccessAwb += 1);
      } else {
        totalError += 1;
      }
      data.push(dataItem);
    }

    const result = new WebScanInBranchResponseVm();
    result.totalData = payload.inputNumber.length;
    result.totalSuccessAwb = totalSuccessAwb;
    result.totalSuccessBag = totalSuccessBag;
    result.totalError = totalError;
    result.data = data;
    return result;
  }

  async findAllPodListByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbFListPodResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbDate'] = 't1.awb_date';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['awbStatusId'] = 't2.awb_status_id_last';
    if (payload.sortBy === '') {
      payload.sortBy = 'awbDate';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbDate',
      },
    ];

    const repo = new OrionRepositoryService(Awb, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_id', 'awbId'],
      ['t1.awb_date', 'awbDate'],
      ['t1.awb_number', 'awbNumber'],
      ['t1.from_id', 'fromId'],
      ['t1.to_id', 'toId'],
      ['t1.consignee_name', 'consigneeName'],
      [`CONCAT(CAST(t1.total_cod_value AS NUMERIC(20,2)))`, 'totalCodValue'],
      ['t2.awb_status_id_last', 'awbStatusIdLast'],
      ['t2.history_date_last', 'historyDateLast'],
      ['t3.district_name', 'districtNameFrom'],
      ['t4.district_name', 'districtNameTo'],
      ['t5.awb_status_title', 'awbStatusTitle'],
      ['t5.is_problem', 'isProblem'],
      [
        `CASE LENGTH (CAST(t6.bag_seq AS varchar(10)))
          WHEN 1 THEN
            CONCAT (t7.bag_number,'00',t6.bag_seq)
          WHEN 2 THEN
            CONCAT (t7.bag_number,'0',t6.bag_seq)
          ELSE
            CONCAT (t7.bag_number,t6.bag_seq) END`,
        'bagNumber',
      ],
      ['t8.branch_name', 'branchName'],
      ['t9.branch_name', 'branchNameLast'],
      ['t10.package_type_code', 'packageTypeCode'],
      ['t11.customer_account_name', 'customerAccountName'],
    );

    q.innerJoin(e => e.awbItems.awbItemAttr, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.district, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.districtTo, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbItems.awbItemAttr.awbStatus, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.awbItems.awbItemAttr.bagItemLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.awbItems.awbItemAttr.bagItemLast.bag, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branchLast, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.packageType, 't10', j =>
      j.andWhere(e => e.is_deleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.customerAccount, 't11', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.fromType, w => w.equals(40));
    q.andWhere(e => e.toType, w => w.equals(40));

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbFListPodResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  private async handleTypeNumber(
    inputNumber: string,
  ): Promise<ScanInputNumberBranchVm> {
    const dataItem = new ScanInputNumberBranchVm();
    const regexNumber = /^[0-9]+$/;

    inputNumber = inputNumber.trim();
    if (inputNumber.length == 12 && regexNumber.test(inputNumber)) {
      // awb number
      const scanIn = new WebScanInVm();
      scanIn.awbNumber = [inputNumber];
      const result = await this.scanInAwbBranch(scanIn);
      dataItem.inputNumber = result.data[0].awbNumber;
      dataItem.status = result.data[0].status;
      dataItem.message = result.data[0].message;
      dataItem.trouble = result.data[0].trouble;
      dataItem.isBag = false;

      return dataItem;
    } else if (
      inputNumber.length == 10 &&
      regexNumber.test(inputNumber.substring(7, 10))
    ) {
      // bag number
      const scanIn = new WebScanInBagVm();
      scanIn.bagNumber = [inputNumber];
      const result = await this.scanInBag(scanIn, false);
      dataItem.inputNumber = result.data[0].bagNumber;
      dataItem.status = result.data[0].status;
      dataItem.message = result.data[0].message;
      dataItem.trouble = result.data[0].trouble;
      dataItem.isBag = true;

      return dataItem;
    } else {
      dataItem.inputNumber = inputNumber;
      dataItem.status = 'error';
      dataItem.message = 'Nomor tidak valid';
      dataItem.trouble = true;
      dataItem.isBag = false;
      return dataItem;
    }
  }
}
