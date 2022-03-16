import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm, BaseMetaPayloadFilterVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { MonitoringHubProblemVm, MonitoringHubTotalProblemVm } from '../../models/monitoring-hub-problem.vm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { HubMonitoringService } from '../../../main/services/web/hub-transit/hub-monitoring.service';
import { DropoffHub } from '../../../../shared/orm-entity/dropoff_hub';
import { RawQueryService } from '../../../../shared/services/raw-query.service';

@Injectable()
export class MonitoringProblemListService {
  static async getDoHub(
    payload: BaseMetaPayloadVm,
    isManual = null,
    isProblem = null,
    isScanOut = null,
  ): Promise<MonitoringHubProblemVm> {
    const statusProblemStr = (await this.getListStatusAwbProblem()).join(',');
    const paramPage = payload.page;
    const paramLimit = payload.limit;
    payload = this.formatPayloadFiltersAwbProblem(payload);

    // Mapping order by key
    const mappingSortBy = {
      scanDate:  'doh.created_time',
      scanDateInHub: 'doh.created_time',
      createdTime : 'doh.created_time',
      branchIdFrom : 'doh.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };
    const mappingBagSortirFilter = {
      bagSortir : 'b1.bag_number',
      bagSeqSortir : 'bi1.bag_seq',
      branchIdFrom : 'b1.branch_id',
    };

    const mappingScanOutFilter = {
      branchIdFrom : 'dp2.branch_id',
    };

    const mappingForBagSortirFilter = {
      bagSortir : 'bag_sortir.bag_number',
      bagSeqSortir : 'bag_sortir.bag_seq',
    };

    const mappingForBagNumberFilter = {
      bagNumber : 'bag_sortir.bag_number',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate:  'doh.created_time',
      scanDateInHub: 'doh.created_time',
      createdTime : 'doh.created_time',
      branchIdFrom : 'doh.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };

    let whereQueryBagSortir = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'bia1.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    let whereQueryScanOut = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dpdb2.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    const whereQueryScanOut2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingScanOutFilter, true);
    const whereQueryBagSortir2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingBagSortirFilter, true);
    const whereQueryForBagSortir = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingForBagSortirFilter, true);
    const whereQueryForBagNumber = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingForBagNumberFilter, true);
    const whereQueryLastStatus = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'ah3.branch_id', ['eq'], 'branchIdFrom');
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    if (!whereQueryBagSortir) {
      whereQueryBagSortir = whereQueryBagSortir2;
    } else {
      whereQueryBagSortir = whereQueryBagSortir2 ? whereQueryBagSortir + '\nAND ' + whereQueryBagSortir2 : whereQueryBagSortir;
    }
    if (!whereQueryScanOut) {
      whereQueryScanOut = whereQueryScanOut2;
    } else {
      whereQueryScanOut = whereQueryScanOut2 ? whereQueryScanOut + '\nAND ' + whereQueryScanOut2 : whereQueryScanOut;
    }
    payload.filters = [];

    payload.globalSearchFields = [
      {
        field: 'br.branch_name',
      },
    ];
    let sortByRaw = '';
    if (payload.sortBy) {
      sortByRaw = 'ORDER BY ' + mappingSortBy[payload.sortBy] + ' ' + payload.sortDir.toUpperCase();
    }
    payload.sortBy = '';

    const repo = new OrionRepositoryService(DropoffHub, 'doh');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`doh.created_time`, 'scanDate'],
      [`bag_sortir.created_time`, 'scanDateInHub'],
      [`dohd.awb_number`, 'awbNumber'],
      [`CASE
          WHEN bag_sortir.bag_number IS NOT NULL
            THEN CONCAT(bag_sortir.bag_number, LPAD(bag_sortir.bag_seq::text, 3, '0'))
          ELSE doh.bag_number
        END`, 'bagNumber'],
      ['\'Yes\'::text', 'do'],
      [`CASE WHEN bag_sortir.bag_number IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'in'],
      [`CASE WHEN scan_out.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'out'],
      [`last_status.awb_status_name`, 'awbStatusName'],
    );

    // ignore filter isManual = null
    let filterIsManual = '';
    if (isManual === false) {
      filterIsManual = `b1.is_manual = FALSE`;
      q.andWhereRaw(`bag_sortir.awb_id IS NOT NULL`);
    } else if (isManual === true) {
      filterIsManual = `b1.is_manual = TRUE`;
      q.andWhereRaw(`bag_sortir.awb_id IS NOT NULL`);
    }

    // ignore filter isProblem = null or isProblem = false
    if (isProblem === true) {
      q.andWhereIsolated(qw => {
        qw.whereRaw(`bag_sortir.awb_id IS NULL
        OR scan_out.awb_id IS NULL
        OR last_status.awb_status_id IN (${statusProblemStr})`);
      });
    }

    // ignore isScanOut = null
    if (isScanOut === false) { // NOT SCAN OUT
      q.andWhereRaw(`scan_out.awb_id IS NULL`);
    } else if (isScanOut === true) {
      q.andWhereRaw(`scan_out.awb_id IS NOT NULL`);
    }

    q.innerJoinRaw(
      'dropoff_hub_detail',
      'dohd',
      `
        dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        INNER JOIN branch br ON br.branch_id = doh.branch_id AND br.is_deleted = FALSE
        INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
        INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE
        LEFT JOIN LATERAL
        (
          SELECT
            bi1.bag_seq,
            ai1.awb_id,
            b1.bag_number,
            bi1.created_time,
            b1.is_manual
          FROM bag_item_awb bia1
          INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE AND dohd.awb_id = ai1.awb_id
          INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
          INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE AND b1.branch_id_to IS NOT NULL
          WHERE
            bia1.is_deleted = FALSE AND b1.is_sortir = TRUE ${filterIsManual ? '\nAND ' + filterIsManual : ''}
            ${whereQueryBagSortir ? 'AND ' + whereQueryBagSortir : ''}
        ) AS bag_sortir ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            ai2.awb_id,
            dpdb2.bag_number,
            br2.branch_id,
            br2.branch_name,
            dpdb2.created_time
          FROM do_pod dp2
          INNER JOIN do_pod_detail_bag dpdb2 ON dpdb2.do_pod_id = dp2.do_pod_id AND dpdb2.is_deleted = FALSE
          INNER JOIN branch br2 ON br2.branch_id = dp2.branch_id_to AND br2.is_deleted = FALSE
          INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE
          INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE AND dohd.awb_id = ai2.awb_id
          WHERE
            dp2.is_deleted = FALSE
            AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
            AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
            ${whereQueryScanOut ? 'AND ' + whereQueryScanOut : ''}
        ) AS scan_out ON TRUE
        INNER JOIN LATERAL (
          SELECT
            ah3.awb_status_id,
            as3.awb_status_name,
            ai3.awb_item_id
          FROM awb_history ah3
          INNER JOIN awb_item ai3 ON ah3.awb_item_id = ai3.awb_item_id AND ai3.awb_id = dohd.awb_id
          INNER JOIN awb_status as3 ON as3.awb_status_id = ah3.awb_status_id
          ${whereQueryLastStatus ? 'AND ' + whereQueryLastStatus : ''}
          ORDER BY
            CASE
              WHEN ah3.awb_status_id = ${AWB_STATUS.BROKE} THEN 1
              WHEN ah3.awb_status_id = ${AWB_STATUS.LOST} THEN 2
              WHEN ah3.awb_status_id = ${AWB_STATUS.OUT_HUB} THEN 3
              WHEN ah3.awb_status_id = ${AWB_STATUS.IN_HUB} THEN 4
              WHEN ah3.awb_status_id = ${AWB_STATUS.DO_HUB} THEN 5
            END, ah3.created_time DESC
            LIMIT 1
        ) AS last_status ON TRUE
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    if (whereQuery) {
      q.andWhereRaw(whereQuery);
    }
    if (whereQueryForBagSortir) {
      q.andWhereRaw(whereQueryForBagSortir);
    }
    if (whereQueryForBagNumber) {
      q.andWhereRaw('bag_sortir.awb_id IS NULL');
    }
    q.groupByRaw(`
      dohd.awb_number,
      bag_sortir.bag_number,
      bag_sortir.bag_seq,
      doh.bag_number,
      doh.created_time,
      bag_sortir.created_time,
      scan_out.awb_id,
      last_status.awb_status_name,
      last_status.awb_status_id,
      c.city_id
      ${sortByRaw}
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubProblemVm();

    result.data = data;
    result.paging = MetaService.set(paramPage, paramLimit, total);

    return result;
  }

  static async getAwbtotalSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubTotalProblemVm> {
    const statusProblemStr = (await this.getListStatusAwbProblem()).join(',');

    payload = this.formatPayloadFiltersAwbProblem(payload);

    // Mapping order by key
    const mappingSortBy = {
      scanDate:  'doh.created_time::DATE',
      scanDateInHub: 'doh.created_time::DATE',
      createdTime : 'doh.created_time::DATE',
      branchIdFrom : 'doh.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };
    const mappingBagSortirFilter = {
      bagSortir : 'b1.bag_number',
      bagSeqSortir : 'bi1.bag_seq',
      branchIdFrom : 'b1.branch_id',
    };

    const mappingScanOutFilter = {
      branchIdFrom : 'dp2.branch_id',
    };

    const mappingForBagSortirFilter = {
      bagSortir : 'bag_sortir.bag_number',
      bagSeqSortir : 'bag_sortir.bag_seq',
    };

    const mappingForBagNumberFilter = {
      bagNumber : 'bag_sortir.bag_number',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate:  'doh.created_time',
      scanDateInHub: 'doh.created_time',
      createdTime : 'doh.created_time',
      branchIdFrom : 'doh.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };

    let whereQueryBagSortir = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'bia1.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    let whereQueryScanOut = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dpdb2.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    const whereQueryScanOut2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingScanOutFilter, true);
    const whereQueryBagSortir2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingBagSortirFilter, true);
    const whereQueryForBagSortir = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingForBagSortirFilter, true);
    const whereQueryForBagNumber = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingForBagNumberFilter, true);
    const whereQueryLastStatus = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'ah3.branch_id', ['eq'], 'branchIdFrom');
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    if (!whereQueryBagSortir) {
      whereQueryBagSortir = whereQueryBagSortir2;
    } else {
      whereQueryBagSortir = whereQueryBagSortir2 ? whereQueryBagSortir + '\nAND ' + whereQueryBagSortir2 : whereQueryBagSortir;
    }

    if (!whereQueryScanOut) {
      whereQueryScanOut = whereQueryScanOut2;
    } else {
      whereQueryScanOut = whereQueryScanOut2 ? whereQueryScanOut + '\nAND ' + whereQueryScanOut2 : whereQueryScanOut;
    }
    payload.filters = [];

    payload.globalSearchFields = [
      {
        field: 'br.branch_name',
      },
    ];
    let sortByRaw = '';
    if (payload.sortBy) {
      sortByRaw = 'ORDER BY ' + mappingSortBy[payload.sortBy] + ' ' + payload.sortDir.toUpperCase();
    }
    payload.sortBy = '';

    const repo = new OrionRepositoryService(DropoffHub, 'doh');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`br.branch_name`, 'branchName'],
      [`doh.created_time::DATE`, 'scanDate'],
      [`br.branch_code`, 'branchCode'],
      [`doh.branch_id`, 'branchId'],
      [`c.city_name`, 'cityName'],
      [`COUNT(
          DISTINCT CASE
            WHEN (bag_sortir.awb_id IS NULL OR scan_out.awb_id IS NULL OR last_status.awb_status_id IN (${statusProblemStr})) THEN dohd.awb_number
          END
        )`, 'problem'],
      [`COUNT(
          DISTINCT dohd.awb_number)`, 'doHub'],
      [`COUNT(
          DISTINCT CASE
            WHEN bag_sortir.is_manual = TRUE THEN dohd.awb_number
        END)`, 'manualSortir'],
      [`COUNT(
          DISTINCT CASE WHEN bag_sortir.is_manual = FALSE THEN dohd.awb_number
        END)`, 'machineSortir'],
      [`COUNT(
          DISTINCT scan_out.awb_id
        )`, 'scanOut'],
      [`COUNT(
          DISTINCT CASE
            WHEN (scan_out.awb_id IS NULL) THEN dohd.awb_number
        END)`, 'notScanOut'],
    );
    q.innerJoinRaw(
      'dropoff_hub_detail',
      'dohd',
      `
      dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
      INNER JOIN branch br ON br.branch_id = doh.branch_id AND br.is_deleted = FALSE
      INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
      INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE
      LEFT JOIN LATERAL
      (
        SELECT
          bi1.bag_seq,
          ai1.awb_id,
          b1.bag_number,
          bi1.created_time,
          b1.is_manual
        FROM bag_item_awb bia1
        INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE AND dohd.awb_id = ai1.awb_id
        INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
        INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE AND b1.branch_id_to IS NOT NULL
        WHERE bia1.is_deleted = FALSE AND b1.is_sortir = TRUE
          ${whereQueryBagSortir ? 'AND ' + whereQueryBagSortir : ''}
      ) AS bag_sortir ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          ai2.awb_id,
          dpdb2.bag_number,
          br2.branch_id,
          br2.branch_name,
          dpdb2.created_time
        FROM do_pod dp2
        INNER JOIN do_pod_detail_bag dpdb2 ON dpdb2.do_pod_id = dp2.do_pod_id AND dpdb2.is_deleted = FALSE
        INNER JOIN branch br2 ON br2.branch_id = dp2.branch_id_to AND br2.is_deleted = FALSE
        INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE
        INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE AND dohd.awb_id = ai2.awb_id
        WHERE
          dp2.is_deleted = FALSE
          AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
          AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
          ${whereQueryScanOut ? 'AND ' + whereQueryScanOut : ''}
      ) AS scan_out ON TRUE
      INNER JOIN LATERAL (
        SELECT
          ah3.awb_status_id,
          as3.awb_status_name,
          ai3.awb_item_id
        FROM awb_history ah3
        INNER JOIN awb_item ai3 ON ah3.awb_item_id = ai3.awb_item_id AND ai3.awb_id = dohd.awb_id
        INNER JOIN awb_status as3 ON as3.awb_status_id = ah3.awb_status_id
        ${whereQueryLastStatus ? 'AND ' + whereQueryLastStatus : ''}
        ORDER BY
          CASE
            WHEN ah3.awb_status_id = ${AWB_STATUS.BROKE} THEN 1
            WHEN ah3.awb_status_id = ${AWB_STATUS.LOST} THEN 2
            WHEN ah3.awb_status_id = ${AWB_STATUS.OUT_HUB} THEN 3
            WHEN ah3.awb_status_id = ${AWB_STATUS.IN_HUB} THEN 4
            WHEN ah3.awb_status_id = ${AWB_STATUS.DO_HUB} THEN 5
          END, ah3.created_time DESC
          LIMIT 1
      ) AS last_status ON TRUE
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    if (whereQuery) {
      q.andWhereRaw(whereQuery);
    }

    if (whereQueryForBagSortir) {
      q.andWhereRaw(whereQueryForBagSortir);
    }

    if (whereQueryForBagNumber) {
      q.andWhereRaw('bag_sortir.awb_id IS NULL');
    }

    q.groupByRaw(`
      br.branch_name,
      br.branch_code,
      c.city_name,
      doh.created_time::DATE,
      doh.branch_id
      ${sortByRaw}
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubTotalProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getDoHubV2(
    payload: BaseMetaPayloadVm,
    isManual = null,
    isProblem = null,
    isScanOut = null,
  ): Promise<MonitoringHubProblemVm> {
    let problemFilter = '';
    if (isManual != null) {
      payload.filters.push({
        field: 'isManual',
        operator: 'eq',
        value: isManual ? 'true' : 'false',
      } as BaseMetaPayloadFilterVm);
    }
    if (isProblem === true) {
      problemFilter = 'hsa.awb_status_id_last >= 23500 AND hsa.awb_status_id_last <= 24000';
    }
    if (isScanOut != null) {
      payload.filters.push({
        field: 'outHub',
        operator: 'eq',
        value: isScanOut ? 'true' : 'false',
      } as BaseMetaPayloadFilterVm);
    }
    const mappingFilter = {
      bagNumber:  'b.bag_number',
      bagSortir: 'bi.bag_number',
      bagSeq : 'bdo.bag_seq',
      bagSeqSortir : 'bin.bag_seq',
      awbNumber : 'hsa.awb_number',
      scanDate : 'hsa.scan_date_do_hub',
      createdTime: 'hsa.scan_date_do_hub',
      branchIdFrom : 'hsa.branch_id',
      isManual : 'bi.is_manual',
      outHub : 'hsa.out_hub',
    };
    const mappingSortBy = {
      scanDate:  'hsa.scan_date_do_hub',
      scanDateInHub: 'hsa.scan_date_do_hub',
      createdTime : 'hsa.scan_date_do_hub',
      branchIdFrom : 'hsa.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'br.branch_id',
      cityId : 'c.city_id',
    };
    const mappingBagNumber = {
      bagNumber : 'b.bag_number',
    };

    payload = this.formatPayloadFiltersAwbProblem(payload);

    const whereQueryBagNumber = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingBagNumber, true);
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);

    // const query = `
    //   SELECT
    //     hsa.scan_date_do_hub AS "scanDate",
    //     hsa.awb_number AS "awbNumber",
    //     CASE
    //       WHEN bi.bag_number IS NOT NULL
    //         THEN CONCAT(bi.bag_number, LPAD(bin.bag_seq::text, 3, '0'))
    //       ELSE CONCAT(b.bag_number, LPAD(bdo.bag_seq::text, 3, '0'))
    //     END AS "bagNumber",
    //     CASE WHEN hsa.do_hub = TRUE THEN 'Yes' ELSE 'No' END AS "do",
    //     CASE WHEN hsa.in_hub = TRUE THEN 'Yes' ELSE 'No' END AS "in",
    //     CASE WHEN hsa.out_hub = TRUE THEN 'Yes' ELSE 'No' END AS "out",
    //     hsa.note AS "awbStatusName"
    //   FROM hub_summary_awb hsa
    //   LEFT JOIN bag_item bdo ON hsa.bag_item_id_do = bdo.bag_Item_id AND bdo.is_deleted = FALSE
    //   LEFT JOIN bag b ON bdo.bag_id = b.bag_id AND b.is_deleted = FALSE
    //   LEFT JOIN bag_item bin ON hsa.bag_item_id_in = bin.bag_Item_id AND bin.is_deleted = FALSE
    //   LEFT JOIN bag bi ON bin.bag_id = bi.bag_id AND bi.is_deleted = FALSE
    //   WHERE
    //     hsa.is_deleted = FALSE ${whereQuery ? 'AND ' + whereQuery : ''} ${problemFilter ? 'AND ' + problemFilter : ''}  ${whereQueryBagNumber ? 'AND hsa.bag_id_in IS NULL' : ''}
    // `;
    const where = [whereQuery ? whereQuery : '', problemFilter ? problemFilter : '', whereQueryBagNumber ? 'hsa.bag_id_in IS NULL' : '', 'hsa.is_deleted = FALSE'];
    const query = `
      SELECT
        hsa.scan_date_do_hub AS "scanDate",
        hsa.awb_number AS "awbNumber",
        bi.bag_number AS "biBagNumber",
        b.bag_number AS "bBagNumber",
        bin.bag_seq AS "binBagSeq",
        bdo.bag_seq AS "bdoBagSeq",
        hsa.do_hub AS "doHub",
        hsa.in_hub AS "inHub",
        hsa.out_hub AS "outHub",
        hsa.note AS "awbStatusName"
      FROM hub_summary_awb hsa
      LEFT JOIN bag_item bdo ON hsa.bag_item_id_do = bdo.bag_Item_id AND bdo.is_deleted = FALSE
      LEFT JOIN bag b ON bdo.bag_id = b.bag_id AND b.is_deleted = FALSE
      LEFT JOIN bag_item bin ON hsa.bag_item_id_in = bin.bag_Item_id AND bin.is_deleted = FALSE
      LEFT JOIN bag bi ON bin.bag_id = bi.bag_id AND bi.is_deleted = FALSE
      WHERE
        ${where.filter(Boolean).join(' AND ')}
    `;

    const queryFix = query +
      `${
        payload.sortBy && mappingSortBy[payload.sortBy] ?
        `ORDER BY ${mappingSortBy[payload.sortBy]} ${payload.sortDir}` :
        `ORDER BY hsa.scan_date_do_hub DESC`
      }
      LIMIT ${payload.limit}
      ${payload.page ? `OFFSET ${payload.limit * (Number(payload.page) - 1)}` : ''}
    `;

    const data = await RawQueryService.query(queryFix);
    console.log('data:', data);
    const queryCount = `SELECT
            COUNT(1) AS total
          FROM hub_summary_awb hsa
          LEFT JOIN bag_item bdo ON hsa.bag_item_id_do = bdo.bag_Item_id AND bdo.is_deleted = FALSE
          LEFT JOIN bag b ON bdo.bag_id = b.bag_id AND b.is_deleted = FALSE
          LEFT JOIN bag_item bin ON hsa.bag_item_id_in = bin.bag_Item_id AND bin.is_deleted = FALSE
          LEFT JOIN bag bi ON bin.bag_id = bi.bag_id AND bi.is_deleted = FALSE
    WHERE
        hsa.is_deleted = FALSE ${whereQuery ? 'AND ' + whereQuery : ''} ${problemFilter ? 'AND ' + problemFilter : ''}  ${whereQueryBagNumber ? 'AND hsa.bag_id_in IS NULL' : ''}
`;
    const total = await RawQueryService.query(queryCount);

    const result = new MonitoringHubProblemVm();

    result.data = data.map(r => ({
      scanDate: r.scanDate,
      awbNumber: r.awbNumber,
      bagNumber: r.biBagNumber != null ? r.biBagNumber.toString() +  r.binBagSeq.toString().padStart(3, '0') : r.bBagNumber.toString() + r.bdoBagSeq.toString().padStart(3, '0'),
      do: r.doHub ? 'Yes' : 'No',
      in: r.inHub ? 'Yes' : 'No',
      out: r.outHub ? 'Yes' : 'No',
      awbStatusName: r.awbStatusName,
    }));
    result.paging = MetaService.set(payload.page, payload.limit, total[0].total);

    return result;
  }

  static async getAwbtotalSortirV2(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubTotalProblemVm> {
    const mappingBagNumber = {
      bagNumber : 'b.bag_number',
    };
    const mappingBagSortir = {
      bagSortir : 'b.bag_number',
    };

    const mappingSubFilter = {
      bagNumber:  'b.bag_number',
      bagSortir: 'b.bag_number',
      bagSeq : 'bi.bag_seq',
      bagSeqSortir : 'bi.bag_seq',
      awbNumber : 'hsa.awb_number',
      scanDate: 'hsa.scan_date_do_hub',
      createdTime: 'hsa.scan_date_do_hub',
    };

    const mappingFilter = {
      branchIdFrom : 'br.branch_id',
      cityId : 'c.city_id',
    };

    const mappingSortBy = {
      scanDate:  'da.scan_date_do_hub',
      scanDateInHub: 'da.scan_date_do_hub',
      createdTime : 'da.scan_date_do_hub',
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      cityId : 'c.city_id',
    };

    payload = this.formatPayloadFiltersAwbProblem(payload);

    const whereQueryBagSortir = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingBagSortir, true);
    const whereQueryBagNumber = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingBagNumber, true);
    const whereSubQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingSubFilter, true);
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    const subQuery = `
      SELECT
        hsa.scan_date_do_hub,
        hsa.branch_id,
        COUNT(hsa.awb_number) as do_hub,
        COUNT(hsa.awb_number) FILTER (WHERE b.is_sortir = TRUE AND b.is_manual = TRUE) as manual_sortir,
        COUNT(hsa.awb_number) FILTER (WHERE b.is_sortir = TRUE AND b.is_manual = FALSE) as machine_sortir,
        COUNT(hsa.awb_number) FILTER (WHERE hsa.out_hub = TRUE) as scanout,
        COUNT(hsa.awb_number) FILTER (WHERE hsa.out_hub = FALSE) as not_scanout,
        COUNT(hsa.awb_number) FILTER (WHERE hsa.awb_status_id_last >= 23500 AND hsa.awb_status_id_last <= 24000) as problem
      FROM hub_summary_awb hsa
      LEFT JOIN bag b ON ${whereQueryBagNumber ? 'hsa.bag_id_do' : 'hsa.bag_id_in'} = b.bag_id AND b.is_deleted = FALSE

      ${whereQueryBagNumber || whereQueryBagSortir ?
      `LEFT JOIN bag_item bi ON ${whereQueryBagSortir ? 'hsa.bag_item_id_in' : 'hsa.bag_item_id_do'} = bi.bag_item_id AND bi.is_deleted = FALSE` : ''
      }
      WHERE
        hsa.is_deleted = FALSE ${whereSubQuery ? 'AND ' + whereSubQuery : ''} ${whereQueryBagNumber ? 'AND hsa.bag_id_in IS NULL' : ''}
      GROUP BY
        hsa.scan_date_do_hub,
        hsa.branch_id
    `;

    const query = `
      SELECT
        br.branch_name AS "branchName",
        da.scan_date_do_hub AS "scanDate",
        br.branch_code AS "branchCode",
        da.branch_id AS "branchId",
        c.city_name AS "cityName",
        da.problem AS "problem",
        da.do_hub AS "doHub",
        da.manual_sortir AS "manualSortir",
        da.machine_sortir AS "machineSortir",
        da.scanout AS "scanOut",
        da.not_scanout AS "notScanOut"
      FROM(
        ${subQuery}
      ) AS da
      INNER JOIN branch br ON da.branch_id = br.branch_id AND br.is_deleted = FALSE
      INNER JOIN district d ON br.district_id = d.district_id AND d.is_deleted = FALSE
      INNER JOIN city c ON d.city_id = c.city_id AND c.is_deleted = FALSE
      ${whereQuery ? 'WHERE ' + whereQuery : ''}
    `;

    const queryFix = query +
      `${
        payload.sortBy && mappingSortBy[payload.sortBy] ?
        `ORDER BY ${mappingSortBy[payload.sortBy]} ${payload.sortDir}` :
        `ORDER BY da.scan_date_do_hub DESC`
      }
      LIMIT ${payload.limit}
      ${payload.page ? `OFFSET ${payload.limit * (Number(payload.page) - 1)}` : ''}
    `;

    const data = await RawQueryService.query(queryFix);
    const total = await RawQueryService.query('SELECT COUNT(*) AS total FROM(' + query + ') n');

    const result = new MonitoringHubTotalProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total[0].total);

    return result;
  }

  static formatPayloadFiltersAwbProblem(payload: BaseMetaPayloadVm) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < payload.filters.length; i++) {
      const field = payload.filters[i].field;
      if (field == 'bagSortir' || field == 'bagNumber') {
        const bagSortir = payload.filters[i].value.substr( 0 , 7);
        const bagSeq = payload.filters[i].value.substr(7 , 10);
        payload.filters[i].value = bagSortir;
        payload.filters.push({field: field == 'bagSortir' ? 'bagSeqSortir' : 'bagSeq', operator: 'eq', value: bagSeq} as BaseMetaPayloadFilterVm);
      }
    }
    return payload;
  }

  static async getAwbManualSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, true);
    return data;
  }

  static async getAwbManualSortirV2(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHubV2(payload, true);
    return data;
  }

  static async getAwbScanOut(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, null, null, true);
    return data;
  }
  static async getAwbScanOutV2(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHubV2(payload, null, null, true);
    return data;
  }

  static async getAwbNotScanOut(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, null, null, false);
    return data;
  }
  static async getAwbNotScanOutV2(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHubV2(payload, null, null, false);
    return data;
  }

  static async getAwbMachineSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, false);
    return data;
  }
  static async getAwbMachineSortirV2(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHubV2(payload, false);
    return data;
  }

  static async getAwbProblem(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, null, true);
    return data;
  }
  static async getAwbProblemV2(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHubV2(payload, null, true);
    return data;
  }

  static async getListStatusAwbProblem() {
    return [AWB_STATUS.BROKE, AWB_STATUS.LOST];
  }
}
