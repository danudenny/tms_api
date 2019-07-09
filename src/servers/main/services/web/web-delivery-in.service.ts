// #region import
import { Injectable } from '@nestjs/common';
import { toInteger } from 'lodash';
import moment = require('moment');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
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
import { WebScanInAwbResponseVm, WebScanInBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInVm } from '../../models/web-scanin.vm';

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
    payload.fieldResolverMap['scanInDateTime'] = 't1.pod_scanin_date_time';
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['branchNameScan'] = 't3.branch_name';
    payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
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
      ['t2.awb_number', 'awbNumber'],
      ['t3.branch_name', 'branchNameScan'],
      ['t4.branch_name', 'branchNameFrom'],
      ['t5.fullname', 'employeeName'],
    );

    q.innerJoin(e => e.awb, 't2', j => j.andWhere(e => e.isDeleted, w => w.isFalse()));
    q.innerJoin(e => e.branch, 't3', j => j.andWhere(e => e.is_deleted, w => w.isFalse()));
    q.leftJoin(e => e.do_pod.branch, 't4', j => j.andWhere(e => e.is_deleted, w => w.isFalse()));
    q.leftJoin(e => e.user.employee, 't5', j => j.andWhere(e => e.is_deleted, w => w.isFalse()));

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
            doPodDetail.scanInType = 'bag_item';
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

      // NOTE:
      // find data to awb where awbNumber and awb status not cancel
      // TODO: relation awb to awb_item_id ???
      const awb = await Awb.findOne({
        select: ['awbId', 'branchId', 'awbStatusIdLast'],
        where: { awbNumber },
      });

      if (awb) {
        // NOTE:
        // check data scan out on (do pod and do pod detail)
        // find data pod scan if exists
        const awbItem = await AwbItem.findOne({
          select: ['awbItemId'],
          where: { awbId: awb.awbId },
        });
        // find do pod detail where awb item id and scan in false
        const doPodDetail = await DoPodDetail.findOne({
          where: {
            awbItemId: awbItem.awbItemId,
            scanOutType: 'awb_item',
            isScanIn: false,
            isDeleted: false,
          },
        });

        if (doPodDetail) {
          // TODO: need reviewed
          // #region comment
          // const checkPodScan = await PodScan.findOne({
          //   where: {
          //     awbItemId: awbItem.awbItemId,
          //   },
          // });

          // // present isScanIn false
          // if (checkPodScan) {
          //   totalError += 1;
          //   // save data to awb_trouble
          //   const awbTrouble = AwbTrouble.create({
          //     awbNumber,
          //     awbStatusId: awb.awbStatusIdLast,
          //     resolveDateTime: timeNow,
          //     employeeId: authMeta.employeeId,
          //     branchId: permissonPayload.branchId,
          //     userIdCreated: authMeta.userId,
          //     createdTime: timeNow,
          //     userIdUpdated: authMeta.userId,
          //     updatedTime: timeNow,
          //   });
          //   await AwbTrouble.save(awbTrouble);

          //   const branch = await Branch.findOne({
          //     where: { branchId: checkPodScan.branchId },
          //   });

          //   response.status = 'error';
          //   response.trouble = true;
          //   response.message = `Resi sudah Scan In pada Gerai ${
          //     branch.branchName
          //   } (${moment(checkPodScan.podScaninDateTime).format(
          //     'YYYY-MM-DD HH:mm:ss',
          //   )})`;
          // }
          // #endregion

          // save data to table pod_scan
          const podScan = PodScan.create();
          podScan.awbId = awb.awbId;
          podScan.awbItemId = awbItem.awbItemId;
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
          doPodDetail.scanInType = 'awb_item';
          doPodDetail.isScanIn = true;
          doPodDetail.updatedTime = timeNow;
          doPodDetail.userIdUpdated = authMeta.userId;
          await DoPodDetail.save(doPodDetail);

          totalSuccess += 1;
        } else {
          // save data to awb_trouble
          const awbTrouble = AwbTrouble.create({
            awbNumber,
            awbStatusId: awb.awbStatusIdLast,
            resolveDateTime: timeNow,
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
          response.message = `Resi belum Scan Out pada Gerai Asal`;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `No Resi ${awbNumber} Tidak di Temukan`;
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

  // TODO: scan in list using orionrepository
  // public static async findAllAwb(payload: BaseMetaPayloadVm) {
  //   const repository = new OrionRepositoryService(PodScan);
  //   const q = repository.findAllRaw();

  //   payload.globalSearchFields = [
  //     {
  //       field: 'scanInDateTime',
  //     },
  //   ];

  //   payload.applyToOrionRepositoryQuery(q, true);

  //   q.selectRaw(
  //     ['pod_scan.pod_scanin_date_time', 'scanInDateTime'],
  //     ['awb.awb_number', 'awbNumber'],
  //     ['branch.branch_name', 'branchNameScan'],
  //     ['branch_from.branch_name', 'branchNameFrom'],
  //     ['employee.fullname', 'employeeName'],
  //   );

  //   // q.innerJoin(e => e.branch);
  //   // q.innerJoin(e => e.awb);
  //   // q.leftJoin(e => e.users);
  //   // q.leftJoin(e => e.users.employee);
  //   // q.leftJoin(e => e.do_pod);
  //   // q.leftJoin(e => e.do_pod.branch);

  //   const data = await q.exec();
  //   const total = await q.countWithoutTakeAndSkip();

  //   const response = new WebScanInListResponseVm();
  //   response.data = data;
  //   response.paging = MetaService.set(payload.page, payload.limit, total);

  //   return response;
  // }

  // private method
  private async isScanOutAwb() {
    // #region scan out
    // // find do pod detail where awb item id and scan in false
    // const doPodDetail = await DoPodDetail.findOne({
    //   where: {
    //     awbItemId: awbItem.awbItemId,
    //     scanOutType: 'awb_item',
    //     isScanIn: false,
    //     isDeleted: false,
    //   },
    // });
    // if (doPodDetail) {
    //   const checkPodScan = await PodScan.findOne({
    //     where: {
    //       awbItemId: awbItem.awbItemId,
    //       doPodId: IsNull(),
    //     },
    //   });
    //   // do_pod_id is null
    //   if (checkPodScan) {
    //     totalError += 1;
    //     // save data to awb_trouble
    //     const awbTrouble = AwbTrouble.create({
    //       awbNumber,
    //       awbStatusId: awb.awbStatusIdLast,
    //       resolveDateTime: timeNow,
    //       employeeId: authMeta.employeeId,
    //       branchId: permissonPayload.branchId,
    //       userIdCreated: authMeta.userId,
    //       createdTime: timeNow,
    //       userIdUpdated: authMeta.userId,
    //       updatedTime: timeNow,
    //     });
    //     await AwbTrouble.save(awbTrouble);
    //     const branch = await Branch.findOne({
    //       where: {
    //         branchId: checkPodScan.branchId,
    //       },
    //     });
    //     response.status = 'error';
    //     response.trouble = true;
    //     response.message = `Resi sudah Scan In pada Gerai ${
    //       branch.branchName
    //     } (${moment(checkPodScan.podScaninDateTime).format(
    //       'YYYY-MM-DD HH:mm:ss',
    //     )})`;
    //   } else {
    //     // save data to table pod_scan
    //     const podScan = PodScan.create();
    //     podScan.awbId = awb.awbId;
    //     podScan.branchId = permissonPayload.branchId;
    //     podScan.awbItemId = awbItem.awbItemId;
    //     podScan.doPodId = doPodDetail.doPodId;
    //     podScan.userId = authMeta.userId;
    //     podScan.podScaninDateTime = timeNow;
    //     await PodScan.save(podScan);
    //     // TODO:
    //     // save data to table awb_history
    //     // update data history id last on awb??
    //     // NOTE:
    //     // Update Data doPodDetail
    //     doPodDetail.scanInType = 'awb_item';
    //     doPodDetail.isScanIn = true;
    //     doPodDetail.updatedTime = timeNow;
    //     doPodDetail.userIdUpdated = authMeta.userId;
    //     await DoPodDetail.save(doPodDetail);
    //     totalSuccess += 1;
    //   }
    // } else {
    //   // save data to awb_trouble
    //   const awbTrouble = AwbTrouble.create({
    //     awbNumber,
    //     awbStatusId: awb.awbStatusIdLast,
    //     resolveDateTime: timeNow,
    //     employeeId: authMeta.employeeId,
    //     branchId: permissonPayload.branchId,
    //     userIdCreated: authMeta.userId,
    //     createdTime: timeNow,
    //     userIdUpdated: authMeta.userId,
    //     updatedTime: timeNow,
    //   });
    //   await AwbTrouble.save(awbTrouble);
    //   totalError += 1;
    //   response.status = 'error';
    //   response.trouble = true;
    //   response.message = `Resi belum Scan Out pada Gerai Asal`;
    // }
    // #endregion scan out
  }
  private async isValidAwbNumber() {}
  private async isScanIn() {}
}
