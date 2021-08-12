import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm, BaseMetaPayloadFilterVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { Bag } from '../../../../shared/orm-entity/bag';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import moment= require('moment');
import { MonitoringHubProblemVm, MonitoringHubProblemLebihSortirVm } from '../../models/monitoring-hub-problem.vm';
import { HubMonitoringService } from '../../../hub/services/integration/hub-monitoring.service';
import { MonitoringProblemListService } from './monitoring-problem-list.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';

@Injectable()
export class MonitoringProblemLebihSortirListService {

  static async getAwbtotalLebihSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemLebihSortirVm> {
    payload = this.formatPayloadFiltersAwbProblem(payload);

    // Mapping order by key
    const mappingSortBy = {
      scanDate: 'hsa.scan_date_in_hub',
      scanDateInHub: 'hsa.scan_date_in_hub',
      createdTime: 'hsa.scan_date_in_hub',
      branchIdFrom: 'hsa.branch_id',
      branchId: 'hsa.branch_id',
      branchName: 'br.branch_name',
      awbNumber: 'hsa.awb_number',
      bagNumber: 'g.bag_number',
      bagSortir: 'g.bag_number',
      bagSeqSortir: 'f.bag_seq',
      cityId: 'b.city_id',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate: 'hsa.scan_date_in_hub',
      scanDateInHub: 'hsa.scan_date_in_hub',
      createdTime: 'hsa.scan_date_in_hub',
      branchIdFrom: 'hsa.branch_id',
      branchNameFrom: 'br.branch_name',
      branchId: 'hsa.branch_id',
      awbNumber: 'hsa.awb_number',
      bagNumber: 'g.bag_number',
      bagSortir: 'g.bag_number',
      bagSeqSortir: 'f.bag_seq',
      cityId: 'b.city_id',
    };

    // const whereQueryDropOffHub = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dohd.created_time', ['gt', 'gte'], 'scanDateDoHub');
    console.log('payload.filters', payload.filters);
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    payload.filters = [];

    payload.globalSearchFields = [
      {
        field: 'b.branch_name',
      },
    ];
    let sortByRaw = '';
    if (payload.sortBy) {
      sortByRaw = mappingSortBy[payload.sortBy];
    }
    console.log('sortByRaw', sortByRaw);
    payload.sortBy = '';
    payload = this.formatPayloadFiltersAwbProblem(payload);
    let sql = `SELECT a.scan_date_in_hub as "scanDateInHub", c.city_id as "cityId", c.city_name as "cityName", a.branch_id as "branchId", b.branch_code as "branchCode", b.branch_name as "branchName", a.total as "lebihSortir"`;
    sql = sql + ` FROM ( SELECT hsa.scan_date_in_hub, hsa.branch_id, count(hsa.awb_number) as total FROM hub_summary_awb hsa`;
    if (whereQuery.includes('f.bag_seq') || whereQuery.includes('g.bag_number')) {
      sql = sql + ` INNER JOIN bag_item f ON hsa.bag_item_id_in = f.bag_item_id INNER JOIN bag g on g.bag_id = f.bag_id`;
    }

    if (whereQuery) {
      sql = sql + ` WHERE ${whereQuery} `;
      sql = sql + ` AND hsa.do_hub = FALSE AND hsa.in_hub = TRUE `;
    } else {
      sql = sql + ` WHERE hsa.do_hub = FALSE AND hsa.in_hub = TRUE `;
    }
    sql = sql + ` GROUP BY hsa.scan_date_in_hub, hsa.branch_id`;
    if (sortByRaw !== '') {
      sql = sql + ` ORDER BY ${sortByRaw} ${payload.sortDir.toUpperCase()}`;
    }
    sql = sql + ` ) a`;
    sql = sql + ` INNER JOIN branch b ON a.branch_id = b.branch_id AND b.is_deleted = FALSE INNER JOIN district d ON d.district_id = b.district_id AND d.is_deleted = FALSE INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE `;
    sql = sql + ` LIMIT ${payload.limit} `;
    const data = await RawQueryService.query(sql, [], false);
    const total = data.length;
    const result = new MonitoringHubProblemLebihSortirVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getLebihSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const statusProblemStr = (await MonitoringProblemListService.getListStatusAwbProblem()).join(',');

    payload = this.formatPayloadFiltersAwbProblem(payload);

    // Mapping order by key
    const mappingSortBy = {
      scanDate: '"hsa"."scan_date_in_hub"::DATE',
      scanDateInHub: '"hsa"."scan_date_in_hub"::DATE',
      createdTime: '"hsa"."scan_date_in_hub"::DATE',
      branchIdFrom: 'hsa.branch_id',
      branchId: 'hsa.branch_id',
      branchName: 'br.branch_name',
      awbNumber: 'hsa.awb_number',
      bagNumber: 'b.bag_number',
      bagSortir: 'b.bag_number',
      bagSeqSortir: 'bi.bag_seq',
      cityId: 'c.city_id',
    };

    // replace fieldResolverMap in Orion as Query Raw
    const mappingFilter = {
      scanDate: '"hsa"."scan_date_in_hub"::DATE',
      scanDateInHub: '"hsa"."scan_date_in_hub"::DATE',
      createdTime: '"hsa"."scan_date_in_hub"::DATE',
      branchIdFrom: 'hsa.branch_id',
      branchId: 'hsa.branch_id',
      branchName: 'br.branch_name',
      awbNumber: 'hsa.awb_number',
      bagNumber: 'b.bag_number',
      bagSortir: 'b.bag_number',
      bagSeqSortir: 'bi.bag_seq',
      cityId: 'c.city_id',
    };

    const mappingScanOutFilter = {
      branchIdFrom: 'hsa.branch_id',
    };

    // let whereSubQueryScanOut = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dpdb2.created_time', ['gt', 'gte'], ['scanDate', 'createdTime', 'scanDateInHub']);
    // const whereSubQueryScanOut2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingScanOutFilter, true);
    // const whereQueryLastStatus = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'ah3.branch_id', ['eq'], 'branchIdFrom');
    // const whereQueryDropOffHub = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dohd.created_time', ['gt', 'gte'], 'scanDateDoHub');
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    // if (!whereSubQueryScanOut) {
    //   whereSubQueryScanOut = whereSubQueryScanOut2;
    // } else {
    //   whereSubQueryScanOut = whereSubQueryScanOut2 ? whereSubQueryScanOut + '\nAND ' + whereSubQueryScanOut2 : whereSubQueryScanOut;
    // }
    payload.filters = [];

    payload.globalSearchFields = [
      {
        field: 'br.branch_name',
      },
    ];
    let sortByRaw = '';
    if (payload.sortBy) {
      sortByRaw = mappingSortBy[payload.sortBy];
    }
    payload.sortBy = '';

    let sql = `SELECT hsa.scan_date_in_hub as "scanDateInHub", hsa.awb_number as "awbNumber", CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0')) as "bagNumber", CASE WHEN hsa.do_hub THEN 'Yes' ELSE 'No' END  as "do", CASE WHEN hsa.in_hub THEN 'Yes' ELSE 'No' END  as "in", CASE WHEN hsa.out_hub THEN 'Yes' ELSE 'No' END  as "out"`;
    sql = sql + ` FROM hub_summary_awb hsa`;
    sql = sql + ` LEFT JOIN bag_item bi ON hsa.bag_item_id_in = bi.bag_item_id AND bi.is_deleted = FALSE`;
    sql = sql + ` LEFT JOIN bag b ON bi.bag_id = b.bag_id AND b.is_deleted = FALSE`;
    sql = sql + ` LEFT JOIN branch br ON br.branch_id = hsa.branch_id`;
    sql = sql + ` LEFT JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE`;
    sql = sql + ` LEFT JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE`;
    sql = sql + ` LEFT JOIN bag_item_awb e ON hsa.awb_number = e.awb_number`;

    if (whereQuery) {
      sql = sql + ` WHERE ${whereQuery}`;
      sql = sql + ` AND hsa.do_hub = FALSE AND hsa.in_hub = TRUE`;
    } else {
      sql = sql + ` WHERE hsa.do_hub = FALSE AND hsa.in_hub = TRUE`;
    }

    sql = sql + ` GROUP BY hsa.scan_date_in_hub, hsa.awb_number, b.bag_number, bi.bag_seq, hsa.do_hub, hsa.in_hub, hsa.out_hub`;
    if (sortByRaw !== '') {
      sql = sql + ` ORDER BY ${sortByRaw} ${payload.sortDir.toUpperCase()}`;
    }
    sql = sql + ` LIMIT ${payload.limit}`;
    const data = await RawQueryService.query(sql, [], false);
    const total = data.length;

    const result = new MonitoringHubProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;

  }

  static async getLebihSortirOld(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const statusProblemStr = (await MonitoringProblemListService.getListStatusAwbProblem()).join(',');

    payload = this.formatPayloadFiltersAwbProblem(payload);

    // Mapping order by key
    const mappingSortBy = {
      scanDate:  '"bi"."created_time"::DATE',
      scanDateInHub: '"bi"."created_time"::DATE',
      createdTime : '"bi"."created_time"::DATE',
      branchIdFrom : 'bag.branch_id',
      branchNameFrom : 'br.branch_name',
      branchId : 'bag.branch_id',
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

    const mappingScanOutFilter = {
      branchIdFrom : 'dp2.branch_id',
    };

    let whereSubQueryScanOut = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter2(payload.filters, 'dpdb2.created_time', ['gt', 'gte'], ['scanDate', 'createdTime', 'scanDateInHub']);
    const whereSubQueryScanOut2 = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingScanOutFilter, true);
    const whereQueryLastStatus = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'ah3.branch_id', ['eq'], 'branchIdFrom');
    const whereQueryDropOffHub = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dohd.created_time', ['gt', 'gte'], 'scanDateDoHub');
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);
    if (!whereSubQueryScanOut) {
      whereSubQueryScanOut = whereSubQueryScanOut2;
    } else {
      whereSubQueryScanOut = whereSubQueryScanOut2 ? whereSubQueryScanOut + '\nAND ' + whereSubQueryScanOut2 : whereSubQueryScanOut;
    }
    payload.filters = [];

    payload.globalSearchFields = [
      {
        field: 'br.branch_name',
      },
    ];
    let sortByRaw = '';
    if (payload.sortBy) {
      sortByRaw = mappingSortBy[payload.sortBy];
    }
    payload.sortBy = '';

    const repo = new OrionRepositoryService(Bag, 'bag');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`bi.created_time`, 'scanDateInHub'],
      [`bia.awb_number`, 'awbNumber'],
      [`CONCAT(bag.bag_number, LPAD(bi.bag_seq::text, 3, '0'))`, 'bagNumber'],
      ['\'No\'', 'do'],
      [`CASE WHEN bag.bag_number IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'in'],
      [`CASE WHEN scan_out.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'out'],
      [`last_status.awb_status_name`, 'awbStatusName'],
    );
    q.innerJoinRaw(
      'bag_item',
      'bi',
      `
        bi.bag_id = bag.bag_id AND bi.is_deleted = FALSE
        INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
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
          WHERE dp2.is_deleted = FALSE AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
          AND dp2.user_id_driver IS NOT NULL
          AND dp2.branch_id_to IS NOT NULL
          ${whereSubQueryScanOut ? 'AND ' + whereSubQueryScanOut : ''}
        ) AS scan_out ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            ah3.awb_status_id,
            as3.awb_status_name,
            ai3.awb_item_id
          FROM awb_history ah3
          INNER JOIN awb_item ai3 ON ah3.awb_item_id = ai3.awb_item_id AND ai3.awb_id = ai.awb_id
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
    if (whereQuery) {
      q.andWhereRaw(whereQuery);
    }
    q.andWhereRaw(
      `NOT EXISTS (
        SELECT * FROM dropoff_hub_detail dohd
        WHERE dohd.awb_number = bia.awb_number
        AND dohd.is_deleted = FALSE
        ${whereQueryDropOffHub ? 'AND ' + whereQueryDropOffHub : ''}
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
    `);
    q.orderByRaw(sortByRaw, payload.sortDir.toUpperCase() == 'ASC' ? 'ASC' : 'DESC');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getAwbtotalLebihSortirOld(
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
      branchIdFrom : 'bag.branch_id',
      branchNameFrom : 'br.branch_name',
      branchId : 'bag.branch_id',
      branchName : 'br.branch_name',
      awbNumber : 'bia.awb_number',
      bagNumber : 'bag.bag_number',
      bagSortir : 'bag.bag_number',
      bagSeqSortir : 'bi.bag_seq',
      cityId : 'c.city_id',
    };

    const whereQueryDropOffHub = await HubMonitoringService.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dohd.created_time', ['gt', 'gte'], 'scanDateDoHub');
    const whereQuery = await HubMonitoringService.orionFilterToQueryRaw(payload.filters, mappingFilter, true);

    payload.filters = [];

    payload.globalSearchFields = [
      {
        field: 'br.branch_name',
      },
    ];
    let sortByRaw = '';
    if (payload.sortBy) {
      sortByRaw = mappingSortBy[payload.sortBy];
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
      [`bag.branch_id`, 'branchId'],
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
      INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
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
      bag.branch_id,
      c.city_name,
      c.city_id,
      bi.created_time::DATE
    `);
    q.orderByRaw(sortByRaw, payload.sortDir.toUpperCase() == 'ASC' ? 'ASC' : 'DESC');

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
      const field = payload.filters[i].field;
      const opt = payload.filters[i].operator;
      if (field == 'bagSortir' || field == 'bagNumber') {
        const bagSortir = payload.filters[i].value.substr( 0 , 7);
        const bagSeq = payload.filters[i].value.substr(7 , 10);
        payload.filters[i].value = bagSortir;
        payload.filters[i].field = 'bagSortir';
        payload.filters.push({field: 'bagSeqSortir', operator: 'eq', value: bagSeq} as BaseMetaPayloadFilterVm);
      }
      if ((field == 'scanDate' || field == 'createdTime' || field == 'scanDateInHub')
        && (opt == 'gt' || opt == 'gte')) {
        const value = moment(payload.filters[i].value).subtract(2, 'days').format('YYYY-MM-DD');
        payload.filters.push({field: 'scanDateDoHub', operator: opt, value} as BaseMetaPayloadFilterVm);
      }
    }
    return payload;
  }
}
