// #region import
import { Injectable } from '@nestjs/common';
import moment = require('moment');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
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
import { WebScanInVm } from '../../models/web-scanin.vm';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
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
    payload.fieldResolverMap['employeeName'] = 't5.fullname';

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
      [
        'CONCAT (t2.bag_number,t6.bag_seq)',
        'bagNumber',
      ],
      ['t3.branch_name', 'branchNameScan'],
      ['t4.branch_name', 'branchNameFrom'],
      ['t5.fullname', 'employeeName'],
    );

    q.innerJoin(e => e.bag_item, 't6', j =>
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

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInBagListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  /**
   * Scan in Bag Number (Hub) - NewFlow
   * Flow Data : https://docs.google.com/document/d/1wnrYqlCmZruMMwgI9d-ko54JGQDWE9sn2yjSYhiAIrg/edit
   * @param {WebScanInBagVm} payload
   * @returns {Promise<WebScanInBagResponseVm>}
   * @memberof WebDeliveryInService
   */
  async scanInBag(payload: WebScanInBagVm): Promise<WebScanInBagResponseVm> {
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
        if (bagData.bagItemStatusIdLast === 1000) {
          const holdRedis = await RedisService.locking(
            `hold:bagscanin:${bagData.bagItemId}`,
            'locking',
          );
          if (holdRedis) {
            // save data to table pod_scan_id
            // TODO: to be review
            const podScanIn = PodScanIn.create();
            // podScanIn.awbId = ??;
            // podScanIn.doPodId = ??;
            podScanIn.scanInType = 'bag';
            podScanIn.employeeId = authMeta.employeeId;
            podScanIn.bagItemId = bagData.bagItemId;
            podScanIn.branchId = permissonPayload.branchId;
            podScanIn.userId = authMeta.userId;
            podScanIn.podScaninDateTime = timeNow;
            await PodScanIn.save(podScanIn);

            // AFTER Scan IN ===============================================
            // #region after scanin
            const bagItem = await BagItem.findOne({
              where: {
                bagItemId: bagData.bagItemId,
              },
            });
            bagItem.bagItemStatusIdLast = 2000;
            bagItem.updatedTime = timeNow;
            bagItem.userIdUpdated = authMeta.userId;
            BagItem.save(bagItem);

            const doPodDetail = await DoPodDetail.findOne({
              where: {
                bagItemId: bagData.bagItemId,
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

              const doPod = await DoPod.findOne({
                where: {
                  doPodId: doPodDetail.doPodId,
                  isDeleted: false,
                },
              });

              // counter total scan in
              doPod.totalScanIn = doPod.totalScanIn + 1;

              if (doPod.totalScanIn === 1) {
                doPod.firstDateScanIn = timeNow;
                doPod.lastDateScanIn = timeNow;
              } else {
                doPod.lastDateScanIn = timeNow;
              }
              await DoPod.save(doPod);
              // TODO: Loop data bag_item_awb
              // SELECT *
              // FROM bag_item_awb
              // WHERE bag_item_id = <bag_item_id> AND is_deleted = false
              const bagItemsAwb = await BagItemAwb.find({
                where: {
                  bagItem: bagData.bagItemId,
                  isDeleted: false,
                },
              });
              if (bagItemsAwb && bagItemsAwb.length > 0) {
                for (const itemAwb of bagItemsAwb) {
                  if (itemAwb.awbItemId) {
                    await DeliveryService.updateAwbAttr(
                      itemAwb.awbItemId, doPod.branchIdTo,
                      3500,
                    );
                    // TODO: queue by Bull
                    DoPodDetailPostMetaQueueService.createJobByScanInBag(
                      doPodDetail.doPodDetailId,
                      itemAwb.awbItemId,
                    );
                  }
                }
              }
              totalSuccess += 1;
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = `No Bag ${bagNumber} belum di Scan Keluar`;
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
          if (bagData.branchIdLast == permissonPayload.branchId) {
            totalSuccess += 1;
            response.message = `No Bag ${bagNumber} sudah di Scan Masuk dari gerai ini`;
          } else {
            // NOTE: create data bag trouble
            // bag_trouble_code = automatic BTR/1907/13/XYZA1234
            // Bag_number
            // Bag_trouble_status = 100 (Read Bag TROUBLE STATUS below)
            // Bag_status_id = <sesuai dengan bag_status_id ketika scan dilakukan>
            // Employee_id = <sesuai login>
            // Branch_id = <sesuai login>
            const bagTroubleCode = await CustomCounterCode.bagTrouble(
              timeNow,
            );
            const bagTrouble = BagTrouble.create({
              bagNumber,
              bagTroubleCode,
              bagTroubleStatus: 100,
              bagStatusId: 2000,
              employeeId: authMeta.employeeId,
              branchId: permissonPayload.branchId,
              userIdCreated: authMeta.userId,
              createdTime: timeNow,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });
            await BagTrouble.save(bagTrouble);

            totalError += 1;
            response.status = 'error';
            response.message = `Gabung Paket belum masuk pada Gerai. Harap Scan Masuk jika Gabung Paket sudah masuk`;
          }
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `No Bag ${bagNumber} Tidak di Temukan`;
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
            // check condition
            if (awb.branchIdLast == permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah di Scan IN di gerai ini`;
            } else {
              // save data to awb_trouble
              const awbTroubleCode = await CustomCounterCode.awbTrouble(
                timeNow,
              );
              const awbTrouble = AwbTrouble.create({
                awbNumber,
                awbTroubleCode,
                awbTroubleStatusId: 100,
                awbStatusId: awb.awbStatusIdLast,
                employeeId: authMeta.employeeId,
                branchId: permissonPayload.branchId,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                userIdPic: authMeta.userId,
                branchIdPic: permissonPayload.branchId,
              });
              await AwbTrouble.save(awbTrouble);

              totalError += 1;
              response.status = 'error';
              response.trouble = true;
              response.message = `Resi Bermasalah pada gerai ${
                awb.branchLast.branchCode
              } - ${
                awb.branchLast.branchName
              }. Harap hubungi CT (Control Tower) Kantor Pusat`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'OUT':
            // TODO: Scan IN resi put on this.processScanInAwb()
            // Add Locking setnx redis
            const holdRedis = await RedisService.locking(`hold:scanin:${awb.awbItemId}`, 'locking');
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

              // Update do_pod_detail ,
              // do_pod set pod_scan_in_id ,
              // is_scan = true, total_scan_in  += 1
              // where is_scan = false and awb_item_id = <awb_item_id>
              // find do pod detail where awb item id and scan in false
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
                // Jika total_scan_in = 1 (resi pertama masuk), maka update first_date_scan_in dan last_date_scan_in
                // Jika total_scan_in > 1 maka update last_date_scan_in
                const doPod = await DoPod.findOne({
                  where: {
                    doPodId: doPodDetail.doPodId,
                    isDeleted: false,
                  },
                });

                // counter total scan in
                doPod.totalScanIn = doPod.totalScanIn + 1;

                if (doPod.totalScanIn === 1) {
                  doPod.firstDateScanIn = timeNow;
                  doPod.lastDateScanIn = timeNow;
                } else {
                  doPod.lastDateScanIn = timeNow;
                }
                await DoPod.save(doPod);
                await DeliveryService.updateAwbAttr(awb.awbItemId, doPod.branchIdTo, 3500);

                // TODO: queue by Bull
                DoPodDetailPostMetaQueueService.createJobByScanInAwb(
                  doPodDetail.doPodDetailId,
                );
                totalSuccess += 1;
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = `Resi ${awbNumber} belum di Scan Keluar`;
              }
              // #endregion after scanin

              // remove key holdRedis
              RedisService.del(`hold:scanin:${awb.awbItemId}`);
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = 'Server Busy';
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

  // private method
}
