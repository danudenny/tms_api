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
import { WebScanInBagListResponseVm, WebScanInListResponseVm, WebScanInBranchListResponseVm, WebScanInHubSortListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInVm, WebScanInBranchResponseVm, ScanInputNumberBranchVm, WebScanInBagBranchVm, WebScanInValidateBranchVm, ScanBranchBagVm, ScanBranchAwbVm, WebScanInBagBranchResponseVm, WebScanInBranchLoadResponseVm } from '../../models/web-scanin.vm';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbTroubleService } from '../../../../shared/services/awb-trouble.service';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { Awb } from '../../../../shared/orm-entity/awb';
import { WebAwbFListPodResponseVm } from '../../models/web-awb-filter-list.response.vm';
import { BagService } from '../v1/bag.service';
import { DropoffHub } from '../../../../shared/orm-entity/dropoff_hub';
import { PodScanInBranch } from '../../../../shared/orm-entity/pod-scan-in-branch';
import { PodScanInBranchBag } from '../../../../shared/orm-entity/pod-scan-in-branch-bag';
import { PodScanInBranchDetail } from '../../../../shared/orm-entity/pod-scan-in-branch-detail';
import { AwbService } from '../v1/awb.service';
import { BagItemHistoryQueueService } from '../../../queue/services/bag-item-history-queue.service';
import { DropoffSortationDetail } from '../../../../shared/orm-entity/dropoff_sortation_detail';
import { DropoffHubDetail } from '../../../../shared/orm-entity/dropoff_hub_detail';
import { DropoffSortation } from '../../../../shared/orm-entity/dropoff_sortation';
import { createQueryBuilder } from 'typeorm';

// #endregion

@Injectable()
export class WebDeliveryInService {
  constructor() {}

  // #region findAll
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
    // q.innerJoin(e => e.do_pod_detail.doPod.branch, 't4', j =>
    //   j.andWhere(e => e.isDeleted, w => w.isFalse()),
    // );
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
    // q.innerJoin(e => e.do_pod_detail.doPod.branch, 't4', j =>
    //   j.andWhere(e => e.isDeleted, w => w.isFalse()),
    // );
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

  async findAllBranchInByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInBranchListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['bagItemId'] = 't1.bag_item_id';
    payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
    payload.fieldResolverMap['branchIdFrom'] = 't4.branch_id';
    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'createdTime',
      },
    ];

    const repo = new OrionRepositoryService(PodScanInBranchBag, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.bag_item_id', 'bagItemId'],
      ['t1.pod_scan_in_branch_id', 'podScanInBranchId'],
      ['t1.created_time', 'createdTime'],
      ['t2.ref_representative_code', 'refRepresentativeCode'],
      ['t4.branch_name', 'branchNameFrom'],
      ['t1.total_awb_item', 'totalAwbItem'],
      ['t1.total_awb_scan', 'totalAwbScan'],
      ['t1.total_diff', 'totalDiff'],
      [`CONCAT(CAST(t3.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
      ['t3.bag_seq', 'bagSeq'],
      ['t2.bag_number', 'bagNumber'],
      [
        `CASE LENGTH (CAST(t3.bag_seq AS varchar(10)))
          WHEN 1 THEN
            CONCAT (t2.bag_number,'00',t3.bag_seq)
          WHEN 2 THEN
            CONCAT (t2.bag_number,'0',t3.bag_seq)
          ELSE
            CONCAT (t2.bag_number,t3.bag_seq) END`,
        'bagNumberCode',
      ],
    );

    q.innerJoin(e => e.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem.branchLast, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(`
      t1.created_time,
      t1.bag_item_id,
      t1.pod_scan_in_branch_id,
      t1.total_awb_item,
      t1.total_awb_scan,
      t1.total_diff,
      t2.bag_number,
      t2.ref_representative_code,
      t4.branch_name,
      t3.bag_seq,
      t3.weight
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInBranchListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async findAllHubSortInByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInHubSortListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't2.created_time';
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

    const repo = new OrionRepositoryService(Bag, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      [
        `CASE LENGTH (CAST(t2.bag_seq AS varchar(10)))
          WHEN 1 THEN
            CONCAT (t1.bag_number,'00',t2.bag_seq)
          WHEN 2 THEN
            CONCAT (t1.bag_number,'0',t2.bag_seq)
          ELSE
            CONCAT (t1.bag_number,t2.bag_seq) END`,
        'bagNumberCode',
      ],
      ['t1.bag_number', 'bagNumber'],
      ['t2.bag_seq', 'bagSeq'],
      ['t2.created_time', 'createdTime'],
      ['t3.district_name', 'districtName'],
      ['COUNT (t4.*)', 'totalAwb'],
      [`CONCAT(CAST(t2.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
    );

    q.innerJoin(e => e.bagItems, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.district, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItems.bagItemAwbs, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.districtIdTo, w => w.isNotNull);
    q.groupByRaw(`
      t2.created_time,
      t2.bag_seq,
      t1.bag_number,
      t2.weight,
      t3.district_name
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInHubSortListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async findAllHubSortDetailByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['bagNumber'] = 't4.bag_number';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
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

    const repo = new OrionRepositoryService(BagItemAwb, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.consignee_address', 'consigneeAddress'],
      ['t5.district_name', 'districtName'],
    );

    q.innerJoin(e => e.awbItem.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem.bag, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbItem.awb.district, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async findAllBagDetailByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['bagNumber'] = 't5.bag_number';
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['bagSeq'] = 't6.bag_seq';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'bagNumber',
      },
      {
        field: 'bagSeq',
      },
    ];

    const repo = new OrionRepositoryService(PodScanInBranchDetail, 't1');
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
    q.innerJoin(e => e.awb.district, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bag, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

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

  // #endregion

  // #region scanIn
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
                  // doPodDetail.podScanInId = podScanIn.podScanInId;
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

                  // counter total scan in awb
                  doPod.totalScanInAwb = doPod.totalScanInAwb + 1;

                  if (doPod.totalScanInAwb == 1) {
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

  async scanInAwbBranch(
    awbNumber: string,
    bagNumber: string,
    podScanInBranchId: string,
  ): Promise<ScanBranchAwbVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // init result
    const dataBag = new ScanBranchBagVm();
    const result = new ScanBranchAwbVm();
    result.awbNumber = awbNumber;
    result.dataBag = null;
    result.trouble = false;
    result.status = 'ok';
    result.message = 'Success';

    const awb = await AwbService.validAwbNumber(awbNumber);
    if (awb) {
      const statusCode = await AwbService.awbStatusGroup(awb.awbStatusIdLast);
      // TODO: change validate status code ??
      // ================================================================
      switch (statusCode) {
        case 'IN':
          if (awb.branchIdLast == permissonPayload.branchId) {
            // NOTE: Mau IN tapi udah IN di BRANCH SAMA = TROUBLE(PASS)
            result.status = 'error';
            result.trouble = true;
            result.message = `Resi ${awbNumber} sudah pernah scan in`;
          } else {
            // TODO: construct data Awb Problem
            // Mau IN tapi udah IN di BRANCH LAIN = TROUBLE
            // Mau IN tapi belum OUT SAMA SEKALI = TROUBLE
            // save data to awb_trouble
            await AwbTroubleService.fromScanIn(awbNumber, awb.awbStatusIdLast);

            result.status = 'error';
            result.trouble = true;
            result.message =
              `Resi ${awbNumber} belum scan out di gerai sebelumnya ` +
              `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
          }
          break;

        case 'POD':
          result.status = 'error';
          result.trouble = true;
          result.message = `Resi ${awbNumber} sudah di proses POD`;
          break;

        case 'OUT':
          // NOTE: check condition disable on check branchIdNext
          // awb.branchIdNext == permissonPayload.branchId;
          break;

        default:
          result.status = 'error';
          result.trouble = true;
          result.message = `Resi ${awbNumber} tidak dapat SCAN IN, Harap hubungi kantor pusat`;
          break;
      }
      // =====================================================================

      if (permissonPayload.branchId) {
        // Add Locking setnx redis
        const holdRedis = await RedisService.locking(
          `hold:scanin-awb-branch:${awb.awbItemId}`,
          'locking',
        );
        if (holdRedis) {
          // save data to table pod_scan_id
          // TODO: find by check data
          let bagId = null;
          let bagItemId = null;

          const podScanInBranchDetail = PodScanInBranchDetail.findOne({
            where: {
              podScanInBranchId,
              awbItemId: awb.awbItemId,
              isDeleted: false,
            },
          });

          if (podScanInBranchDetail) {
            // TODO: update data podScanInBranchDetail
          } else {
            if (bagNumber != '') {
              const bagData = await DeliveryService.validBagNumber(bagNumber);
              if (bagData) {
                const bagItemAwb = await BagItemAwb.findOne({
                  where: {
                    bagItemId: bagData.bagItemId,
                    awbItemId: awb.awbItemId,
                    isDeleted: false,
                  },
                });

                if (!bagItemAwb) {
                  result.status = 'error';
                  result.message = `Resi ${awbNumber} tidak ada dalam gabung paket`;
                }
                // set data
                bagId = bagData.bagId;
                bagItemId = bagData.bagItemId;

                dataBag.bagId = bagId;
                dataBag.bagItemId = bagItemId;
                dataBag.status = 'ok';
                dataBag.message = 'Success';
                dataBag.trouble = false;
                result.dataBag = dataBag;
              }
              result.status = 'ok';
              result.message = 'Success';
            } else {
              result.status = 'error';
              result.message = `Resi ${awbNumber} tidak ada dalam gabung paket`;
            }

            const podScanInBranchDetailObj = PodScanInBranchDetail.create();
            podScanInBranchDetailObj.podScanInBranchId = podScanInBranchId;
            podScanInBranchDetailObj.bagId = bagId;
            podScanInBranchDetailObj.bagItemId = bagItemId;
            podScanInBranchDetailObj.awbId = awb.awbItem.awbId;
            podScanInBranchDetailObj.awbItemId = awb.awbItemId;
            podScanInBranchDetailObj.isTrouble = result.status == 'error' ? true : false;
            await PodScanInBranchDetail.save(podScanInBranchDetailObj);

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
            // #endregion after scanin
          }

          // remove key holdRedis
          RedisService.del(`hold:scanin-awb-branch:${awb.awbItemId}`);
        } else {
          result.status = 'error';
          result.message = 'Server Busy';
        }
      } else {
        // save data to awb_trouble
        await AwbTroubleService.fromScanIn(awbNumber, awb.awbStatusIdLast);
        result.status = 'error';
        result.trouble = true;
        result.message =
          `Resi ${awbNumber} milik gerai ` +
          `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
      }
    } else {
      result.status = 'error';
      result.message = `Resi ${awbNumber} Tidak di Temukan`;
    }
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

  async scanInBagBranch(
    bagData: BagItem,
    bagNumber: string,
    podScanInBranchId: string,
  ): Promise<WebScanInBagBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInBagBranchResponseVm();

    let totalSuccess = 0;
    let totalError = 0;
    let response = new ScanBranchBagVm();
    response = {
      bagId: null,
      bagItemId: null,
      status: 'ok',
      trouble: false,
      message: 'Success',
    };

    if (bagData) {
      // NOTE: check condition disable on check branchIdNext
      // bagData.branchIdNext == permissonPayload.branchId;
      if (permissonPayload.branchId) {
        if (bagData.bagItemStatusIdLast) {
          const holdRedis = await RedisService.locking(
            `hold:bag-scanin-branch:${bagData.bagItemId}`,
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
            }

            // pod_scan_in_branch_bag;
            const podScanInBranchBag = await PodScanInBranchBag.findOne({
              where: {
                podScanInBranchId,
                bagId: bagData.bagId,
                bagItemId: bagData.bagItemId,
                isDeleted: false,
              },
            });

            if (podScanInBranchBag) {
              totalError += 1;
              response.status = 'error';
              response.message = 'Already exist!!!';
            } else {
              const bagItem = await BagItem.findOne({
                where: {
                  bagItemId: bagData.bagItemId,
                },
              });
              if (bagItem) {
                // update bagItem
                bagItem.bagItemStatusIdLast = 2000;
                bagItem.branchIdLast = permissonPayload.branchId;
                bagItem.updatedTime = timeNow;
                bagItem.userIdUpdated = authMeta.userId;
                BagItem.save(bagItem);

                // NOTE: background job for insert bag item history
                BagItemHistoryQueueService.addData(
                  bagData.bagItemId,
                  2000,
                  permissonPayload.branchId,
                  authMeta.userId,
                );
                // get data awb on bag
                const bagItemsAwb = await BagItemAwb.find({
                  where: {
                    bagItemId: bagData.bagItemId,
                    isDeleted: false,
                  },
                });

                if (bagItemsAwb && bagItemsAwb.length > 0) {
                  for (const itemAwb of bagItemsAwb) {
                    if (itemAwb.awbItemId) {
                      const dataAwb = new ScanInputNumberBranchVm();

                      dataAwb.awbNumber = itemAwb.awbNumber;
                      dataAwb.status = 'ok';
                      dataAwb.message = 'Success';
                      dataAwb.trouble = false;

                      dataItem.push(dataAwb);
                    }
                  } // end of loop
                } else {
                  console.log('### Data tidak ditemukan !!');
                }

                // NOTE: create podScanInBranchBag
                const podScanInBranchBagObj = PodScanInBranchBag.create();
                podScanInBranchBagObj.podScanInBranchId = podScanInBranchId;
                podScanInBranchBagObj.branchId = permissonPayload.branchId;
                podScanInBranchBagObj.bagId = bagData.bagId;
                podScanInBranchBagObj.bagItemId = bagData.bagItemId;
                podScanInBranchBagObj.totalAwbItem = bagItemsAwb.length;
                podScanInBranchBagObj.totalAwbScan = 0;
                podScanInBranchBagObj.totalDiff = 0;
                PodScanInBranchBag.save(podScanInBranchBagObj);
              }
            }

            // #endregion after scanin

            // remove key holdRedis
            RedisService.del(`hold:bag-scanin-branch:${bagData.bagItemId}`);
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
      response.bagId = bagData.bagId;
      response.bagItemId = bagData.bagItemId;
    } else {
      totalError += 1;
      response.status = 'error';
      response.message = `Gabung paket ${bagNumber} Tidak di Temukan`;
    }

    // TODO: refactoring
    result.totalData = dataItem.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.dataBag = response;
    result.data = dataItem;

    return result;
  }

  // NOTE: scan dropoff_hub
  async scanInBagHub(payload: WebScanInBagVm): Promise<WebScanInBagResponseVm> {
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

        // TODO: find bag do_pod and update??
        // SKIP.

        const bagItem = await BagItem.findOne({
          where: {
            bagItemId: bagData.bagItemId,
          },
        });
        if (bagItem) {
          // update status bagItem
          BagItem.update(bagItem.bagItemId, {
            bagItemStatusIdLast: 3500,
            branchIdLast: permissonPayload.branchId,
            updatedTime: timeNow,
            userIdUpdated: authMeta.userId,
          });
          // NOTE: background job for insert bag item history
          BagItemHistoryQueueService.addData(
            bagData.bagItemId,
            3500,
            permissonPayload.branchId,
            authMeta.userId,
          );

          // create data dropoff hub
          const dropoffHub = DropoffHub.create();
          dropoffHub.branchId = permissonPayload.branchId;
          dropoffHub.bagId = bagData.bag.bagId;
          dropoffHub.bagItemId = bagData.bagItemId;
          await DropoffHub.save(dropoffHub);

          // TODO: send on background job ??
          // create dropoff hub detail
          // NOTE: status DO_HUB (12600: drop off hub)
          await BagService.statusDropoffAwbBag(
            bagData.bagItemId,
            dropoffHub.dropoffHubId,
          );
          totalSuccess += 1;
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

  // NOTE: scan in package on branch
  // 1. scan bag number / scan awb number
  // 2. create session per branch with insert table on pod scan in branch
  // 2. scan awb number on bag and calculate
  async scanInBranch(
    payload: WebScanInBagBranchVm,
  ): Promise<WebScanInBranchResponseVm> {
    let isBag: boolean = false;
    let data: ScanInputNumberBranchVm[] = [];
    let dataBag = new ScanBranchBagVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const regexNumber = /^[0-9]+$/;
    const dataItem = new ScanInputNumberBranchVm();

    // create pod_scan_in_branch
    if (payload.podScanInBranchId == '') {
      const podScanInBranch = PodScanInBranch.create();
      podScanInBranch.branchId = permissonPayload.branchId;
      podScanInBranch.scanInType = 'bag'; // default
      podScanInBranch.transactionStatusId = 600;
      podScanInBranch.totalBagScan = 0;

      await PodScanInBranch.save(podScanInBranch);
      payload.podScanInBranchId = podScanInBranch.podScanInBranchId;
    }

    for (let inputNumber of payload.scanValue) {
      // Check type scan value number
      inputNumber = inputNumber.trim();
      if (inputNumber.length == 12 && regexNumber.test(inputNumber)) {
        // awb number
        const resultAwb = await this.scanInAwbBranch(
          inputNumber,
          payload.bagNumber,
          payload.podScanInBranchId,
        );

        dataItem.awbNumber = resultAwb.awbNumber;
        dataItem.status = resultAwb.status;
        dataItem.message = resultAwb.message;
        dataItem.trouble = resultAwb.trouble;
        data.push(dataItem);

        dataBag = resultAwb.dataBag;
      } else if (
        inputNumber.length == 10 &&
        regexNumber.test(inputNumber.substring(7, 10))
      ) {
        // check valid bag
        const bagData = await BagService.validBagNumber(inputNumber);
        const resultBag = await this.scanInBagBranch(
          bagData,
          inputNumber,
          payload.podScanInBranchId,
        );
        if (resultBag) {
          isBag = true;
          data = resultBag.data;
          dataBag = resultBag.dataBag;
        }
      } else {
        dataItem.awbNumber = inputNumber;
        dataItem.status = 'error';
        dataItem.message = 'Nomor tidak valid';
        dataItem.trouble = true;
        data.push(dataItem);
      }
    }

    const result = new WebScanInBranchResponseVm();
    result.bagNumber = payload.bagNumber;
    result.podScanInBranchId = payload.podScanInBranchId;
    result.isBag = isBag;
    result.data = data;
    result.dataBag = dataBag;
    return result;
  }

  async scanInValidateBranch(payload: WebScanInValidateBranchVm): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    if (payload.bagNumberDetail && payload.bagNumberDetail.length) {
      for (const item of payload.bagNumberDetail) {
        const bagData = await BagService.validBagNumber(item.bagNumber);
        if (bagData) {
          // NOTE: update data pod scan in branch bag
          const podScanInBag = await PodScanInBranchBag.findOne({
            where: {
              podScanInBranchId: payload.podScanInBranchId,
              bagId: bagData.bagId,
              bagItemId: bagData.bagItemId,
              isDeleted: false,
            },
          });
          if (podScanInBag) {
            const totalDiff = item.totalAwbInBag - item.totalAwbScan;
            PodScanInBranchBag.update(podScanInBag.podScanInBranchBagId, {
              totalAwbScan: item.totalAwbScan,
              totalDiff,
            });
          }
          // NOTE: add to bag trouble
          const bagTroubleCode = await CustomCounterCode.bagTrouble(timeNow);
          const bagTrouble = BagTrouble.create({
            bagNumber: item.bagNumber,
            bagTroubleCode,
            bagTroubleStatus: 100,
            bagStatusId: 2000,
            employeeId: authMeta.employeeId,
            branchId: permissonPayload.branchId,
          });
          await BagTrouble.save(bagTrouble);
        }
      }
    }

    // TODO: update data podScanInBranch
    const podScanInBranch = await PodScanInBranch.findOne({
      where: {
        podScanInBranchId: payload.podScanInBranchId,
        isDeleted: false,
      },
    });

    if (podScanInBranch) {
      PodScanInBranch.update(payload.podScanInBranchId, {
        transactionStatusId: 700,
      });
    }

    return { status: 'ok' };
  }

  async loadBranchPackage(): Promise<WebScanInBranchLoadResponseVm> {
    const permissonPayload = AuthService.getPermissionTokenPayload();
    let podScanInBranchId = '';
    let data = [];

    const podScanInBranch = await PodScanInBranch.findOne({
      where: {
        branchId: permissonPayload.branchId,
        transactionStatusId: 600,
        isDeleted: false,
      },
    });

    if (podScanInBranch) {
      podScanInBranchId = podScanInBranch.podScanInBranchId;
      const qz = createQueryBuilder();
      qz.addSelect('bag_item_awb.awb_number', 'awbNumber');
      qz.addSelect('bag_item_awb.awb_number', 'awbNumber');
      qz.from('pod_scan_in_branch_detail', 'psi_bd');
      qz.innerJoin(
        'awb_item_attr', 'aia',
        'aia.awb_item_id = psi_bd.awb_item_id and aia.is_deleted = false',
      );
      qz.leftJoin(
        'bag_item',
        'bi',
        'bi.bag_item_id = psi_bd.bag_item_id and bi.is_deleted = false',
      );
      qz.leftJoin(
        'bag',
        'bag',
        'bag.bag_id = psi_bd.bag_id and bag.is_deleted = false',
      );
      qz.where(
        'psi_bd.pod_scan_in_branch_id = :podScanInBranchId AND psi_bd.is_deleted = false',
        {
          podScanInBranchId,
        },
      );

      data = await qz.getRawMany();
    } else {
      console.log('not found!');
    }

    // TODO: response vm ??
    const result = new WebScanInBranchLoadResponseVm();
    result.podScanInBranchId = podScanInBranchId;
    result.data = data;
    return result;
  }

  async loadDropOffList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInHubSortListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchIdFrom'] = 't3.branch_id_last';
    payload.fieldResolverMap['representativeFrom'] =
      't2.ref_representative_code';
    payload.fieldResolverMap['bagNumberCode'] = 't2.bag_number';
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
        `CASE LENGTH (CAST(t3.bag_seq AS varchar(10)))
          WHEN 1 THEN
            CONCAT (t2.bag_number,'00',t3.bag_seq)
          WHEN 2 THEN
            CONCAT (t2.bag_number,'0',t3.bag_seq)
          ELSE
            CONCAT (t2.bag_number,t3.bag_seq) END`,
        'bagNumberCode',
      ],
      ['t2.bag_number', 'bagNumber'],
      ['t2.ref_representative_code', 'representativeCode'],
      ['t3.bag_seq', 'bagSeq'],
      ['t1.created_time', 'createdTime'],
      ['t1.dropoff_hub_id', 'dropoffHubId'],
      ['t5.branch_name', 'branchName'],
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
    q.innerJoin(e => e.bagItem.branchLast, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(`
      t1.created_time,
      t1.dropoff_hub_id,
      t3.bag_seq,
      t2.bag_number,
      t2.ref_representative_code,
      t3.weight,
      t5.branch_name
      `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInHubSortListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async loadDropOffListDetail(
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
    q.innerJoin(e => e.awb.district, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async loadSortationList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInHubSortListResponseVm> {
    // mapping field
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchIdFrom'] = 't3.branch_id_last';
    payload.fieldResolverMap['representativeFrom'] =
      't2.ref_representative_code';
    payload.fieldResolverMap['bagNumberCode'] = 't2.bag_number';
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

    const repo = new OrionRepositoryService(DropoffSortation, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      [
        `CASE LENGTH (CAST(t3.bag_seq AS varchar(10)))
          WHEN 1 THEN
            CONCAT (t2.bag_number,'00',t3.bag_seq)
          WHEN 2 THEN
            CONCAT (t2.bag_number,'0',t3.bag_seq)
          ELSE
            CONCAT (t2.bag_number,t3.bag_seq) END`,
        'bagNumberCode',
      ],
      ['t2.bag_number', 'bagNumber'],
      ['t2.ref_representative_code', 'representativeCode'],
      ['t3.bag_seq', 'bagSeq'],
      ['t1.created_time', 'createdTime'],
      ['t1.dropoff_sortation_id', 'dropoffSortationId'],
      ['t5.branch_name', 'branchName'],
      ['COUNT (t4.*)', 'totalAwb'],
      [`CONCAT(CAST(t3.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
    );

    q.innerJoin(e => e.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.dropoffSortationDetails, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem.branchLast, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(`
      t1.created_time,
      t1.dropoff_sortation_id,
      t3.bag_seq,
      t2.bag_number,
      t2.ref_representative_code,
      t3.weight,
      t5.branch_name
      `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanInHubSortListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async loadSortationListDetail(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['dropoffSortationId'] = 't1.dropoff_sortation_id';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'dropoffSortationId',
      },
    ];

    const repo = new OrionRepositoryService(DropoffSortationDetail, 't1');
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
    q.innerJoin(e => e.awb.district, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  // #endregion
}
