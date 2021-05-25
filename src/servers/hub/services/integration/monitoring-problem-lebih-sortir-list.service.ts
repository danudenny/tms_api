import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm, BaseMetaPayloadFilterVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { MonitoringHubProblemVm, MonitoringHubTotalProblemVm, MonitoringHubProblemLebihSortirVm } from '../../models/monitoring-hub-problem.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { MonitoringProblemListService } from './monitoring-problem-list.service';
import { HubMonitoringService } from '../../../main/services/web/hub-transit/hub-monitoring.service';

@Injectable()
export class MonitoringProblemLebihSortirListService {

  static async getLebihSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const statusProblemStr = (await MonitoringProblemListService.getListStatusAwbProblem()).join(',');

    payload = this.formatPayloadFiltersAwbProblem(payload);

    // Mapping order by key
    const mappingSortBy = {
      scanDate:  '"bi"."created_time"::DATE',
      scanDateInHub: '"bi"."created_time"::DATE',
      createdTime : '"bi"."created_time"::DATE',
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      branchId : 'br.branch_id',
      branchName : 'br.branch_name',
      awbNumber : 'bia.awb_number',
      bagNumber : 'bag.bag_number',
      bagSortir : 'bag.bag_number',
      bagSeqSortir : 'bi.bag_seq',
      cityId : 'c.city_id',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate:  'bi.created_time',
      scanDateInHub: 'bi.created_time',
      createdTime : 'bi.created_time',
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      branchId : 'br.branch_id',
      branchName : 'br.branch_name',
      awbNumber : 'bia.awb_number',
      bagNumber : 'bag.bag_number',
      bagSortir : 'bag.bag_number',
      bagSeqSortir : 'bi.bag_seq',
      cityId : 'c.city_id',
    };

    const whereSubQueryScanOut = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dp2.created_time', ['gt', 'gte'], ['scanDate', 'createdTime', 'scanDateInHub']);
    const whereQueryBagItemAwb = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'bia00.created_time', ['gt', 'gte'], ['scanDate', 'createdTime', 'scanDateInHub']);
    const whereQueryDropOffHub = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dohd.created_time', ['gt', 'gte'], ['scanDate', 'createdTime', 'scanDateInHub']);
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);

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

    payload.applyToOrionRepositoryQuery(q);
    q.selectRaw(
      [`bi.created_time`, 'scanDateInHub'],
      [`bia.awb_number`, 'awbNumber'],
      [`CONCAT(bag.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`, 'bagNumber'],
      ['\'No\'::text', 'do'],
      [`CASE WHEN bag.bag_number IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'in'],
      [`CASE WHEN scan_out.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'out'],
      [`last_status.awb_status_name`, 'awbStatusName'],
    );
    q.innerJoinRaw(
      'bag_item',
      'bi',
      `
        bi.bag_id = bag.bag_id AND bi.is_deleted = FALSE
        INNER JOIN LATERAL (
          SELECT *
          FROM bag_item_awb bia00
          WHERE bia00.bag_item_id = bi.bag_item_id
            AND bia00.is_deleted = FALSE
            ${'AND ' + whereQueryBagItemAwb}
          ORDER BY bia00.bag_item_awb_id DESC
          LIMIT 1
        ) AS bia ON TRUE
        INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
        INNER JOIN branch br ON br.branch_id = bag.branch_id AND br.is_deleted = FALSE
        INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
        INNER JOIN city c ON c.city_id = d.city_id
        AND c.is_deleted = FALSE
        LEFT JOIN LATERAL (
          SELECT
            ai2.awb_id,
            dpdb2.bag_number,
            br2.branch_id,
            dpdb2.created_time
          FROM
            do_pod dp2
          INNER JOIN do_pod_detail_bag dpdb2 ON dpdb2.do_pod_id = dp2.do_pod_id AND dpdb2.is_deleted = FALSE
          INNER JOIN branch br2 ON br2.branch_id = dp2.branch_id_to AND br2.is_deleted = FALSE
          INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE AND bia2.awb_number = bia.awb_number
          INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE
          WHERE dp2.is_deleted = FALSE AND dp2.do_pod_type IN (${POD_TYPE.OUT_HUB},${POD_TYPE.OUT_HUB_TRANSIT})
          AND dp2.user_id_driver IS NOT NULL
          AND dp2.branch_id_to IS NOT NULL
          ${'AND ' + whereSubQueryScanOut}
        ) AS scan_out ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            ah3.awb_status_id,
            as3.awb_status_name
          FROM
            awb_history ah3
          INNER JOIN awb_status as3 ON as3.awb_status_id = ah3.awb_status_id
          INNER JOIN bag_item_awb bia3 ON bia3.awb_item_id = ah3.awb_item_id AND bia3.awb_number = bia.awb_number AND bia3.is_deleted = FALSE
          ORDER BY
            ah3.history_date DESC
          LIMIT 1
        ) AS last_status ON TRUE
    `);
    if (whereQuery) {
      q.andWhereRaw(whereQuery);
    }
    q.andWhereRaw(
      `NOT EXISTS (
        SELECT * FROM dropoff_hub_detail dohd
        WHERE dohd.awb_number = bia.awb_number
        AND dohd.is_deleted = FALSE
        ${'AND ' + whereQueryDropOffHub}
      )`,
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(`
      bia.awb_number,
      bi.created_time::DATE,
      bag.bag_number,
      bi.bag_seq,
      bi.created_time,
      last_status.awb_status_name,
      c.city_id,
      scan_out.awb_id
    ${sortByRaw}
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getAwbtotalLebihSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemLebihSortirVm> {
    payload = this.formatPayloadFiltersAwbProblem(payload);

    // Mapping order by key
    const mappingSortBy = {
      scanDate:  '"bi"."created_time"::DATE',
      scanDateInHub: '"bi"."created_time"::DATE',
      createdTime : '"bi"."created_time"::DATE',
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      branchId : 'br.branch_id',
      branchName : 'br.branch_name',
      awbNumber : 'bia.awb_number',
      bagNumber : 'bag.bag_number',
      bagSortir : 'bag.bag_number',
      bagSeqSortir : 'bi.bag_seq',
      cityId : 'c.city_id',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate:  'bi.created_time',
      scanDateInHub: 'bi.created_time',
      createdTime : 'bi.created_time',
      branchIdFrom : 'br.branch_id',
      branchNameFrom : 'br.branch_name',
      branchId : 'br.branch_id',
      branchName : 'br.branch_name',
      awbNumber : 'bia.awb_number',
      bagNumber : 'bag.bag_number',
      bagSortir : 'bag.bag_number',
      bagSeqSortir : 'bi.bag_seq',
      cityId : 'c.city_id',
    };

    const whereQueryBagItemAwb = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'bia00.created_time', ['gt', 'gte'], ['scanDate', 'createdTime', 'scanDateInHub']);
    const whereQueryDropOffHub = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dohd.created_time', ['gt', 'gte'], ['scanDate', 'createdTime', 'scanDateInHub']);
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);

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

    payload = this.formatPayloadFiltersAwbProblem(payload);

    const repo = new OrionRepositoryService(Bag, 'bag');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`bi.created_time::DATE`, 'scanDateInHub'],
      [`c.city_name`, 'cityName'],
      [`c.city_id`, 'cityId'],
      [`br.branch_name`, 'branchName'],
      [`br.branch_code`, 'branchCode'],
      [`br.branch_id`, 'branchId'],
      [`COUNT (
          DISTINCT ai.awb_id
        )`, 'lebihSortir',
      ],
    );
    q.innerJoinRaw(
      'bag_item',
      'bi',
      `
      bi.bag_id = bag.bag_id AND bi.is_deleted = FALSE
      INNER JOIN LATERAL (
        SELECT *
        FROM bag_item_awb bia00
        WHERE bia00.bag_item_id = bi.bag_item_id
          AND bia00.is_deleted = FALSE
          ${'AND ' + whereQueryBagItemAwb}
        ORDER BY bia00.bag_item_awb_id DESC
        LIMIT 1
      ) AS bia ON TRUE
      INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
      INNER JOIN branch br ON br.branch_id = bag.branch_id AND br.is_deleted = FALSE
      INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
      INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE
    `);
    if (whereQuery) {
      q.andWhereRaw(whereQuery);
    }
    q.andWhereRaw(
      `NOT EXISTS (
        SELECT * FROM dropoff_hub_detail dohd
        WHERE dohd.awb_number = bia.awb_number
        AND dohd.is_deleted = FALSE
        ${'AND ' + whereQueryDropOffHub}
      )`,
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    q.groupByRaw(`
      br.branch_name,
      br.branch_code,
      br.branch_id,
      c.city_name,
      c.city_id,
      bi.created_time::DATE
      ${sortByRaw}
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubProblemLebihSortirVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static formatPayloadFiltersAwbProblem(payload: BaseMetaPayloadVm) {

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < payload.filters.length; i++) {
      if (payload.filters[i].field == 'bagSortir' || payload.filters[i].field == 'bagNumber') {
        const bagSortir = payload.filters[i].value.substr( 0 , 7);
        const bagSeq = payload.filters[i].value.substr(7 , 10);
        payload.filters[i].value = bagSortir;
        payload.filters[i].field = 'bagSortir';
        payload.filters.push({field: 'bagSeqSortir', operator: 'eq', value: bagSeq} as BaseMetaPayloadFilterVm);
      }
    }
    return payload;
  }
}
