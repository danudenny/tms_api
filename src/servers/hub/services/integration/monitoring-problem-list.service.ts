import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm, BaseMetaPayloadFilterVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { MonitoringHubProblemVm, MonitoringHubTotalProblemVm } from '../../models/monitoring-hub-problem.vm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { Bag } from '../../../../shared/orm-entity/bag';
import {HubMonitoringService} from '../../../main/services/web/hub-transit/hub-monitoring.service';

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
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };
    const mappingBagSortirFilter = {
      bagSortir : 'b1.bag_number',
      bagSeqSortir : 'bi1.bag_seq',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate:  'doh.created_time',
      scanDateInHub: 'doh.created_time',
      createdTime : 'doh.created_time',
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };

    let whereQueryBagSortir = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'bia1.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    const whereQueryScanOut = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dp2.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    const whereQueryBagSortir2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingBagSortirFilter, true);
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    if (!whereQueryBagSortir) {
      whereQueryBagSortir = whereQueryBagSortir2;
    } else {
      whereQueryBagSortir = whereQueryBagSortir2 ? whereQueryBagSortir + '\nAND ' + whereQueryBagSortir2 : whereQueryBagSortir;
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

    const repo = new OrionRepositoryService(Bag, 'bag');
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
      [`CASE WHEN (scan_out.awb_id IS NOT NULL OR scan_out_sortiran_transit.awb_id IS NOT NULL) THEN 'Yes' ELSE 'No' END`, 'out'],
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
      'dropoff_hub',
      'doh',
      `
        bag.bag_id = doh.bag_id AND doh.is_deleted = FALSE
        INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        INNER JOIN bag_item bi ON bi.bag_item_id = doh.bag_item_id AND bi.is_deleted = FALSE
        INNER JOIN LATERAL (
          SELECT *
          FROM bag_item_awb bia00
          WHERE bia00.bag_item_id = bi.bag_item_id
            AND bia00.is_deleted = FALSE
          ORDER BY bia00.bag_item_awb_id DESC
          LIMIT 1
        ) AS bia ON TRUE
        INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
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
          WHERE bia1.is_deleted = FALSE AND b1.is_sortir = TRUE ${filterIsManual ? '\nAND ' + filterIsManual : ''}
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
          -- INNER JOIN users u2 ON u2.user_id = dpdb2.user_id_created AND u2.is_deleted = FALSE
          WHERE
            dp2.is_deleted = FALSE
            AND dp2.do_pod_type IN (${POD_TYPE.OUT_HUB}, ${POD_TYPE.OUT_HUB_TRANSIT})
            AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
            ${whereQueryScanOut ? 'AND ' + whereQueryScanOut : ''}
        ) AS scan_out ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            ai.awb_id
          FROM do_pod dp2
          INNER JOIN do_pod_detail dpd2 ON dpd2.do_pod_id = dp2.do_pod_id AND ai.awb_item_id = dpd2.awb_item_id
            AND ai.awb_item_id = dpd2.awb_item_id AND dpd2.is_deleted = FALSE
          WHERE
            dp2.is_deleted = FALSE
            AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB_AWB}
            ${whereQueryScanOut ? 'AND ' + whereQueryScanOut : ''}
        ) AS scan_out_sortiran_transit ON TRUE
        INNER JOIN LATERAL (
          SELECT
            ah3.awb_status_id,
            as3.awb_status_name
          FROM awb_history ah3
          INNER JOIN awb_status as3 ON as3.awb_status_id = ah3.awb_status_id
          INNER JOIN bag_item_awb bia3 ON bia3.awb_item_id = ah3.awb_item_id
          INNER JOIN awb_item ai3 ON ai3.awb_item_id = bia3.awb_item_id AND ai3.is_deleted = FALSE AND dohd.awb_id = ai3.awb_id
          ORDER BY ah3.history_date DESC
          LIMIT 1
        ) AS last_status ON TRUE
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    if (whereQuery) {
      q.andWhereRaw(whereQuery);
    }
    // q.andWhereRaw(`
    //   bag.branch_id IS NOT NULL
    //   -- AND (bag.is_sortir IS NULL OR bag.is_sortir = FALSE)
    // `);
    q.groupByRaw(`
      dohd.awb_number,
      bag_sortir.bag_number,
      bag_sortir.bag_seq,
      doh.bag_number,
      doh.created_time,
      bag_sortir.created_time,
      -- br.branch_name,
      scan_out.awb_id,
      last_status.awb_status_name,
      last_status.awb_status_id,
      c.city_id,
      scan_out_sortiran_transit.awb_id
      ${sortByRaw}
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubProblemVm();

    result.data = data;
    result.paging = MetaService.set(paramPage, paramLimit, total);

    // const data = await q.exec();
    // const total = await q.countWithoutTakeAndSkip();

    // const result = new MonitoringHubProblemVm();

    // result.data = data;
    // result.paging = MetaService.set(payload.page, payload.limit, total);

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
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };
    const mappingBagSortirFilter = {
      bagSortir : 'b1.bag_number',
      bagSeqSortir : 'bi1.bag_seq',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate:  'doh.created_time',
      scanDateInHub: 'doh.created_time',
      createdTime : 'doh.created_time',
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      awbNumber : 'dohd.awb_number',
      bagNumber : 'doh.bag_number',
      cityId : 'c.city_id',
    };

    let whereQueryBagSortir = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'bia1.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    const whereQueryScanOut = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dp2.created_time', ['gt', 'gte'], ['scanDate', 'createdTime']);
    const whereQueryBagSortir2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingBagSortirFilter, true);
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    if (!whereQueryBagSortir) {
      whereQueryBagSortir = whereQueryBagSortir2;
    } else {
      whereQueryBagSortir = whereQueryBagSortir2 ? whereQueryBagSortir + '\nAND ' + whereQueryBagSortir2 : whereQueryBagSortir;
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

    const repo = new OrionRepositoryService(Bag, 'bag');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`br.branch_name`, 'branchName'],
      [`doh.created_time::DATE`, 'scanDate'],
      [`br.branch_code`, 'branchCode'],
      [`br.branch_id`, 'branchId'],
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
      'dropoff_hub',
      'doh',
      `
      bag.bag_id = doh.bag_id AND doh.is_deleted = FALSE
      INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
      INNER JOIN bag_item bi ON bi.bag_item_id = doh.bag_item_id AND bi.is_deleted = FALSE
      INNER JOIN LATERAL (
        SELECT *
        FROM bag_item_awb bia00
        WHERE bia00.bag_item_id = bi.bag_item_id
          AND bia00.is_deleted = FALSE
        ORDER BY bia00.bag_item_awb_id DESC
        LIMIT 1
      ) AS bia ON TRUE
      INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
      INNER JOIN "public"."branch" "br" ON br.branch_id = doh.branch_id AND br.is_deleted = FALSE
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
        ${whereQueryBagSortir ? '\nAND ' + whereQueryBagSortir : ''}
      ) AS bag_sortir ON true
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
          AND dp2.do_pod_type IN (${POD_TYPE.OUT_HUB}, ${POD_TYPE.OUT_HUB_TRANSIT})
          AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
          ${whereQueryScanOut ? '\nAND ' + whereQueryScanOut : ''}
      ) AS scan_out ON TRUE
      INNER JOIN LATERAL (
        SELECT
          ah3.awb_status_id,
          as3.awb_status_name
        FROM awb_history ah3
        INNER JOIN awb_status as3 ON as3.awb_status_id = ah3.awb_status_id
        INNER JOIN bag_item_awb bia3 ON bia3.awb_item_id = ah3.awb_item_id AND bia3.awb_number = dohd.awb_number AND bia3.is_deleted = FALSE
        ORDER BY ah3.history_date DESC
        LIMIT 1
      ) AS last_status ON TRUE
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    if (whereQuery) {
      q.andWhereRaw(whereQuery);
    }
    // q.andWhereRaw(`
    //   bag.branch_id IS NOT NULL
    //   -- AND (bag.is_sortir IS NULL OR bag.is_sortir = FALSE)
    // `);

    q.groupByRaw(`
      br.branch_name,
      br.branch_code,
      br.branch_id,
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

  static formatPayloadFiltersAwbProblem(payload: BaseMetaPayloadVm) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < payload.filters.length; i++) {
      if (payload.filters[i].field == 'bagSortir') {
        const bagSortir = payload.filters[i].value.substr( 0 , 7);
        const bagSeq = payload.filters[i].value.substr(7 , 10);
        payload.filters[i].value = bagSortir;
        payload.filters.push({field: 'bagSeqSortir', operator: 'eq', value: bagSeq} as BaseMetaPayloadFilterVm);
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

  static async getAwbScanOut(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, null, null, true);
    return data;
  }

  static async getAwbNotScanOut(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, null, null, false);
    return data;
  }

  static async getAwbMachineSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, false);
    return data;
  }

  static async getAwbProblem(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const data = this.getDoHub(payload, null, true);
    return data;
  }

  static async getListStatusAwbProblem() {
    return [AWB_STATUS.BROKE, AWB_STATUS.LOST];
  }
}
