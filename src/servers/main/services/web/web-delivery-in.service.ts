// #region import
import { Injectable } from '@nestjs/common';
import { toInteger } from 'lodash';
import moment = require('moment');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { DoPodDetail } from '../../../../shared/orm-entity/do-pod-detail';
import { PodScan } from '../../../../shared/orm-entity/pod-scan';
import { AuthService } from '../../../../shared/services/auth.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { WebDeliveryListFilterPayloadVm } from '../../models/web-delivery-payload.vm';
import {
  WebScanInAwbResponseVm,
  WebScanInBagResponseVm,
} from '../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { PodScanIn } from '../../../../shared/orm-entity/pod-scan-in';
import { AwbStatusGroupItem } from '../../../../shared/orm-entity/awb-status-group-item';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { AwbAttr } from '../../../../shared/orm-entity/awb-attr';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
// #endregion

@Injectable()
export class WebDeliveryInService {
  constructor() {}

  async findAllDeliveryList(
    payload: WebDeliveryListFilterPayloadVm,
  ): Promise<WebScanInListResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;

    const offset = (page - 1) * take;
    const start = moment(payload.filters.startDeliveryDateTime).toDate();
    const end = moment(payload.filters.endDeliveryDateTime).toDate();

    // TODO: FIX QUERY and Add Additional Where Condition
    const whereCondition =
      'WHERE pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end';
    // TODO: add additional where condition

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT pod_scanin_date_time as "scanInDateTime",
        awb.awb_number as "awbNumber",
        branch.branch_name as "branchNameScan",
        branch_from.branch_name as "branchNameFrom",
        employee.fullname as "employeeName"
      FROM pod_scan
        JOIN branch ON pod_scan.branch_id = branch.branch_id
        JOIN awb ON awb.awb_id = pod_scan.awb_id AND awb.is_deleted = false
        LEFT JOIN users ON users.user_id = pod_scan.user_id AND users.is_deleted = false
        LEFT JOIN employee ON employee.employee_id = users.employee_id AND employee.is_deleted = false
        LEFT JOIN do_pod ON do_pod.do_pod_id = pod_scan.do_pod_id
        LEFT JOIN branch branch_from ON do_pod.branch_id = branch_from.branch_id
      ${whereCondition}
      LIMIT :take OFFSET :offset`,
      { take, start, end, offset },
    );

    const [
      querycount,
      parameterscount,
    ] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end `,
      { start, end },
    );

    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new WebScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(page, take, Number(total[0].count));

    return result;
  }

  async findAllAwbByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInListResponseVm> {
    // mapping field
    payload.fieldResolverMap['podScanInDateTime'] = 't1.pod_scanin_date_time';
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['branchScan'] = 't3.branch_id';
    payload.fieldResolverMap['branchNameScan'] = 't3.branch_name';
    payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
    payload.fieldResolverMap['branchOriginFrom'] = 't4.branch_id';
    payload.fieldResolverMap['employeeName'] = 't5.fullname';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'scanInDateTime',
      },
    ];

    const repo = new OrionRepositoryService(PodScan, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.pod_scanin_date_time', 'podScanInDateTime'],
      ['t2.awb_number', 'awbNumber'],
      ['t3.branch_name', 'branchNameScan'],
      ['t4.branch_name', 'branchNameFrom'],
      ['t5.fullname', 'employeeName'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.is_deleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.do_pod.branch, 't4', j =>
      j.andWhere(e => e.is_deleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.user.employee, 't5', j =>
      j.andWhere(e => e.is_deleted, w => w.isFalse()),
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
  ): Promise<WebScanInListResponseVm> {
    // mapping field
    payload.fieldResolverMap['scanInDateTime'] = 't1.pod_scanin_date_time';
    payload.fieldResolverMap['deliveryDateTime'] = 't1.pod_scanin_date_time';
    payload.fieldResolverMap['bagNumber'] = 't2.bag_number';
    payload.fieldResolverMap['branchScan'] = 't3.branch_id';
    payload.fieldResolverMap['branchNameScan'] = 't3.branch_name';
    payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
    payload.fieldResolverMap['branchOriginFrom'] = 't4.branch_id';
    payload.fieldResolverMap['employeeName'] = 't5.fullname';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'scanInDateTime',
      },
    ];

    const repo = new OrionRepositoryService(PodScan, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.pod_scanin_date_time', 'scanInDateTime'],
      ['t2.bag_number', 'bagNumber'],
      ['t3.branch_name', 'branchNameScan'],
      ['t4.branch_name', 'branchNameFrom'],
      ['t5.fullname', 'employeeName'],
    );

    q.innerJoin(e => e.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.is_deleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.do_pod.branch, 't4', j =>
      j.andWhere(e => e.is_deleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.user.employee, 't5', j =>
      j.andWhere(e => e.is_deleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

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
      const bagRepository = new OrionRepositoryService(Bag);
      const qBag = bagRepository.findOne();
      // Manage relation (default inner join)
      qBag.innerJoin(e => e.bagItems);
      qBag.leftJoin(e => e.bagItems.bagItemAwbs);

      qBag.select({
        bagId: true,
        bagNumber: true,
        bagItems: {
          bagItemId: true,
          bagItemAwbs: {
            bagItemAwbId: true,
            awbItemId: true,
          },
        },
      });
      // q2.where(e => e.bagItems.bagId, w => w.equals('421862'));
      qBag.where(e => e.bagNumber, w => w.equals(bagNumber));
      qBag.andWhere(e => e.isDeleted, w => w.equals(false));
      const bagData = await qBag.exec();

      if (bagData) {
        for (const bagItem of bagData.bagItems) {
          // find do pod detail where awb item id and scan in false
          const doPodDetail = await DoPodDetail.findOne({
            where: {
              bagItemId: bagItem.bagItemId,
              scanOutType: 'bag_item',
              isScanIn: false,
              isDeleted: false,
            },
          });

          // NOTE: Bag Number belum scan in
          if (doPodDetail) {
            // #region check pod scan
            // // NOTE: jika awb awbHistoryIdLast >= 1500 dan tidak sama dengan 1800 (cancel) boleh scan out
            // const checkPodScan = await PodScan.findOne({
            //   where: {
            //     bagItemId: bagItem.bagItemId,
            //   },
            // });
            // // do_pod_id is null
            // if (checkPodScan) {
            //   totalError += 1;
            // } else {
            //   totalSuccess += 1;
            // }
            // #endregion

            // save data to table pod_scan
            const podScan = PodScan.create();
            podScan.bagItemId = bagItem.bagItemId;
            podScan.branchId = permissonPayload.branchId;
            podScan.doPodId = doPodDetail.doPodId;
            podScan.userId = authMeta.userId;
            podScan.podScaninDateTime = timeNow;
            await PodScan.save(podScan);

            // TODO:
            // save data to table awb_history
            // update data history id last on awb??
            // ...
            // ...

            // NOTE:
            // Update Data doPodDetail
            doPodDetail.isScanIn = true;
            doPodDetail.updatedTime = timeNow;
            doPodDetail.userIdUpdated = authMeta.userId;
            await DoPodDetail.save(doPodDetail);

            totalSuccess += 1;
          } else {
            // save data to bag_trouble
            const bagTrouble = BagTrouble.create({
              bagNumber,
              resolveDateTime: timeNow,
              employeeId: authMeta.employeeId,
              branchId: permissonPayload.branchId,
              userIdCreated: authMeta.userId,
              createdTime: timeNow,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
              description: response.message,
            });
            await BagTrouble.save(bagTrouble);

            totalError += 1;
            response.status = 'error';
            response.trouble = true;
            response.message = `Bag Number belum Scan Out pada Gerai Asal`;
          }
        } // end of loop
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Bag ${bagNumber} Tidak di Temukan`;
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
   * Flow Data : https://slack-files.com/TEL84PB2L-FLAF2QSHL-9c0532c4a6
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

      const awb = await this.validAwbNumber(awbNumber);
      if (awb) {
        const statusCode = await this.awbStatusGroup(awb.awbStatusIdLast);
        switch (statusCode) {
          case 'IN':
            // check condition
            if (awb.branchIdLast === permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah di Scan IN di gerai ini`;
            } else {
              // save data to awb_trouble
              const awbTroubleCode = await CustomCounterCode.awbTrouble(
                timeNow.toString(),
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
              podScanIn.awbItemId = awb.awbItemId;
              podScanIn.branchId = permissonPayload.branchId;
              podScanIn.userId = authMeta.userId;
              podScanIn.podScaninDateTime = timeNow;
              await PodScanIn.save(podScanIn);

              // Update awb_item_attr  semua field dengan suffix _last
              const awbItemAttr = await AwbItemAttr.findOne({
                where: {
                  awbItemAttrId: awb.awbItemAttrId,
                },
              });

              // AFTER Scan IN ===============================================
              // #region after scanin
              // TODO: how to update data??
              // awbItemAttr.awbHistoryIdLast;
              // awbItemAttr.awbStatusIdLastPublic;
              // awbItemAttr.awbStatusIdLast;

              // awbItemAttr.userIdLast;
              // awbItemAttr.branchIdLast;
              // awbItemAttr.historyDateLast;
              // await AwbItemAttr.save(awbItemAttr);

              // Update awb_attr  semua field dengan suffix _last
              const awbAttr = await AwbAttr.findOne({
                where: {
                  awbAttrId: awb.awbAttrId,
                },
              });
              // TODO: how to update data??
              // awbAttr.awbHistoryIdLast;
              // awbAttr.awbStatusIdLastPublic;
              // awbAttr.awbStatusIdLast;
              // await AwbAttr.save(awbAttr);

              // Update do_pod_detail ,
              // do_pod set pod_scan_in_id ,
              // is_scan = true, total_scan_in  += 1
              // where is_scan = false and awb_item_id = <awb_item_id>

              // find do pod detail where awb item id and scan in false
              const doPodDetail = await DoPodDetail.findOne({
                where: {
                  awbItemId: awb.awbItemId,
                  scanOutType: 'awb_item',
                  isScanIn: false,
                  isDeleted: false,
                },
              });
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

              // TODO:
              // Insert awb_history  (Note bg process + scheduler)
              // Update awb_item_summary  (Note bg process + scheduler)
              // ...
              // ...
              // #endregion after scanin
              totalSuccess += 1;

              // remove key holdRedis
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
  private async processScanInAwb() {
    // #region process_scan_in
    // #endregion process_scan_in
  }

  private async validAwbNumber(awbNumber: string): Promise<AwbItemAttr> {
    // NOTE: raw query
    // SELECT ai.awb_status_id_last, ai.awb_item_id, br.branch_code, br.branch_name
    // FROM awb_item_attr ai
    // INNER JOIN branch br ON ai.branch_id_last = br.branch_id
    // WHERE ai.awb_number = :awb_number

    // find data to awb where awbNumber and awb status not cancel
    const awbRepository = new OrionRepositoryService(AwbItemAttr);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.branchLast);

    q.select({
      awbItemAttrId: true,
      awbStatusIdLast: true,
      awbItemId: true,
      awbNumber: true,
      branchIdLast: true,
      branchLast: {
        branchId: true,
        branchCode: true,
        branchName: true,
      },
    });
    // q2.where(e => e.bagItems.bagId, w => w.equals('421862'));
    q.where(e => e.awbNumber, w => w.equals(awbNumber));
    return await q.exec();
  }

  private async awbStatusGroup(awbStatusId: number) {
    const awbRepository = new OrionRepositoryService(AwbStatusGroupItem);
    const q = awbRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.awbStatusGroup);

    q.select({
      awbStatusGroupItemId: true,
      awbStatusGroup: {
        awbStatusGroupId: true,
        code: true,
      },
    });

    q.where(e => e.awbStatusId, w => w.equals(awbStatusId));
    const result = await q.exec();
    return result.awbStatusGroup.code;
  }
}
