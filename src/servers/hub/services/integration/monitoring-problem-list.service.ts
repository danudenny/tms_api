import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm, BaseMetaPayloadFilterVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DropoffHub } from '../../../../shared/orm-entity/dropoff_hub';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { MonitoringHubProblemVm, MonitoringHubTotalProblemVm } from '../../models/monitoring-hub-problem.vm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { Bag } from '../../../../shared/orm-entity/bag';

@Injectable()
export class MonitoringProblemListService {
  static async getDoHub(
    payload: BaseMetaPayloadVm,
    isManual = null,
    isProblem = null,
  ): Promise<MonitoringHubProblemVm> {
    const statusProblemStr = (await this.getListStatusAwbProblem()).join(',');

    payload.fieldResolverMap['createdTime'] = 'doh.created_time';
    payload.fieldResolverMap['scanDate'] = 'doh.created_time';
    payload.fieldResolverMap['branchIdFrom'] = 'br.branch_id';
    payload.fieldResolverMap['branchNameFrom'] = 'br.branch_name';
    payload.fieldResolverMap['branchIdTo'] = 'scan_out.branch_id';
    payload.fieldResolverMap['branchTo'] = 'scan_out.branch_name';
    payload.fieldResolverMap['awbNumber'] = 'dohd.awb_number';
    payload.fieldResolverMap['bagNumber'] = 'doh.bag_number';
    payload.fieldResolverMap['bagSortir'] = 'bag_sortir.bag_number';
    payload.fieldResolverMap['bagSeqSortir'] = 'bag_sortir.bag_seq';
    payload.fieldResolverMap['cityId'] = 'c.city_id';

    payload.globalSearchFields = [
      {
        field: 'scan_out.branch_name',
      },
    ];

    if (!payload.sortBy) {
      payload.sortBy = 'createdTime';
    }

    payload = this.formatPayloadFiltersAwbProblem(payload);

    const repo = new OrionRepositoryService(DropoffHub, 'doh');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`MAX(dohd.created_time)`, 'scanDate'],
      [`dohd.awb_number`, 'awbNumber'],
      [`CASE
          WHEN bag_sortir.bag_number IS NOT NULL AND scan_out.awb_id IS NOT NULL AND last_status.awb_status_id NOT IN (${statusProblemStr})
            THEN CONCAT(bag_sortir.bag_number, LPAD(bag_sortir.bag_seq::text, 3, '0'))
          ELSE doh.bag_number
        END`, 'bagNumber'],
      ['\'Yes\'', 'do'],
      [`CASE WHEN bag_sortir.bag_number IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'in'],
      [`CASE WHEN scan_out.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'out'],
      [`last_status.awb_status_name`, 'awbStatusName'],
    );

    if (isManual === false) {
      q.andWhereRaw(`bag.is_manual = FALSE
      AND bag_sortir.awb_id IS NOT NULL
      AND scan_out.awb_id IS NOT NULL
      AND last_status.awb_status_id NOT IN (${statusProblemStr})`);
    } else if (isManual === true) {
      q.andWhereRaw(`bag.is_manual = TRUE
      AND bag_sortir.awb_id IS NOT NULL
      AND scan_out.awb_id IS NOT NULL
      AND last_status.awb_status_id NOT IN (${statusProblemStr})`);
    }

    if (isProblem === true) {
      q.andWhereIsolated(qw => {
        qw.whereRaw(`bag_sortir.awb_id IS NULL
        OR scan_out.awb_id IS NULL
        OR last_status.awb_status_id IN (${statusProblemStr})`);
      });
    }
    q.innerJoinRaw(
      'branch',
      'br',
      `
        br.branch_id = doh.branch_id AND br.is_deleted = FALSE
        INNER JOIN bag bag ON bag.bag_id = doh.bag_id AND bag.is_deleted = FALSE AND bag.branch_id IS NOT NULL AND (is_sortir IS NULL OR is_sortir = FALSE)
        INNER JOIN bag_item bi ON bi.bag_item_id = doh.bag_item_id AND bi.is_deleted = FALSE
        INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
        INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
        INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        INNER JOIN branch br ON br.branch_id = dohd.branch_id_to AND br.is_deleted = FALSE
        INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
        INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE
        LEFT JOIN LATERAL
        (
          SELECT
            bi1.bag_seq,
            ai1.awb_id,
            b1.bag_number,
            bi1.created_time
            br1.branch_id
          FROM bag_item_awb bia1
          INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE
          INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
          INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE AND b1.branch_id_to IS NOT NULL
          WHERE bia1.is_deleted = FALSE AND bia1.awb_number = bia.awb_number
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
          INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE AND bia2.awb_number = bia.awb_number
          INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE
          WHERE
            dp2.is_deleted = FALSE
            AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
            AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
        ) AS scan_out ON true
        INNER JOIN LATERAL (
          SELECT
            ah3.awb_status_id,
            as3.awb_status_name
          FROM
            awb_history ah3
          INNER JOIN awb_status as3 ON as3.awb_status_id = ah3.awb_status_id
          INNER JOIN bag_item_awb bia3 ON bia3.awb_item_id = ah3.awb_item_id AND bia3.awb_number = dohd.awb_number AND bia3.is_deleted = FALSE
            AND bia3.is_deleted = FALSE
          ORDER BY
            ah3.history_date DESC
          LIMIT 1
        ) AS last_status ON TRUE
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('doh.branch_id IS NOT NULL');
    q.andWhereRaw('bag.branch_id IS NOT NULL AND (bag.is_sortir IS NULL OR bag.is_sortir = FALSE)');
    q.groupByRaw(`
      dohd.awb_number,
      bag_sortir.bag_number,
      bag_sortir.bag_seq,
      doh.bag_number,
      doh.created_time,
      -- br.branch_name,
      scan_out.awb_id,
      doh.branch_id,
      scan_out.branch_id,
      scan_out.branch_name,
      bag.is_manual,
      last_status.awb_status_name,
      last_status.awb_status_id,
      c.city_id
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getAwbtotalSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubTotalProblemVm> {
    const statusProblemStr = (await this.getListStatusAwbProblem()).join(',');

    payload.fieldResolverMap['createdTime'] = '"doh"."created_time"::DATE';
    payload.fieldResolverMap['scanDate'] = 'doh.created_time';
    payload.fieldResolverMap['branchIdFrom'] = 'bag_sortir.branch_id';
    payload.fieldResolverMap['branchNameFrom'] = 'bag_sortir.branch_name';
    payload.fieldResolverMap['branchIdTo'] = 'scan_out.branch_id';
    payload.fieldResolverMap['branchNameTo'] = 'scan_out.branch_name';
    payload.fieldResolverMap['awbNumber'] = 'dohd.awb_number';
    payload.fieldResolverMap['bagNumber'] = 'doh.bag_number';
    payload.fieldResolverMap['bagSortir'] = 'bag_sortir.bag_number';
    payload.fieldResolverMap['bagSeqSortir'] = 'bag_sortir.bag_seq';
    payload.fieldResolverMap['cityId'] = 'bag_sortir.city_id';

    payload.globalSearchFields = [
      {
        field: 'scan_out.branch_name',
      },
    ];
    payload = this.formatPayloadFiltersAwbProblem(payload);

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
            WHEN (is_manual = true AND bag_sortir.awb_id IS NOT NULL AND scan_out.awb_id IS NOT NULL AND last_status.awb_status_id NOT IN (${statusProblemStr})) THEN dohd.awb_number
        END)`, 'manualSortir'],
      [`COUNT(
          DISTINCT CASE WHEN (is_manual = false AND bag_sortir.awb_id IS NOT NULL AND scan_out.awb_id IS NOT NULL AND last_status.awb_status_id NOT IN (${statusProblemStr}))
            THEN dohd.awb_number
        END)`, 'machineSortir'],
      [`COUNT(
          DISTINCT scan_out.awb_id
        )`, 'scanOut'],
      [`COUNT(
          DISTINCT CASE
            WHEN (scan_out.awb_id IS NULL) THEN dohd.awb_number
        END)`, 'notScanOut'],
      [`COUNT(
          DISTINCT CASE
            WHEN (dohd.awb_number IS NULL AND scan_out.awb_id IS NOT NULL) THEN ai.awb_id
        END)`, 'lebihSortir'],
    );
    q.innerJoinRaw(
      'bag_item',
      'bi',
      `
        bi.bag_id = bag.bag_id AND bi.is_deleted = FALSE
        LEFT JOIN dropoff_hub doh ON doh.bag_id = bag.bag_id AND doh.is_deleted = FALSE and doh.branch_id IS NOT NULL
        LEFT JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
        INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
        INNER JOIN branch br ON br.branch_id = dohd.branch_id_to AND br.is_deleted = FALSE
        INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
        INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE
        LEFT JOIN LATERAL
        (
          SELECT
            bi1.bag_seq,
            ai1.awb_id,
            b1.bag_number,
            bi1.created_time,
            c1.city_name,
            c1.city_id,
            br1.branch_name,
            br1.branch_code,
            br1.branch_id
          FROM bag_item_awb bia1
          INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE
          INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
          INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE AND b1.branch_id_to IS NOT NULL
          WHERE bia1.is_deleted = FALSE AND bia1.awb_number = bia.awb_number
        ) AS bag_sortir ON true
        LEFT JOIN LATERAL (
          SELECT
            ai2.awb_id,
            dpdb2.bag_number,
            br2.branch_id,
            dpdb2.created_time
          FROM do_pod dp2
          INNER JOIN do_pod_detail_bag dpdb2 ON dpdb2.do_pod_id = dp2.do_pod_id AND dpdb2.is_deleted = FALSE
          INNER JOIN branch br2 ON br2.branch_id = dp2.branch_id_to AND br2.is_deleted = FALSE
          INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE AND bia2.awb_number = bia.awb_number
          INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE
          WHERE
            dp2.is_deleted = FALSE
            AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
            AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
        ) AS scan_out ON true
        INNER JOIN LATERAL (
          SELECT
            ah3.awb_status_id
          FROM
            awb_history ah3
          INNER JOIN bag_item_awb bia3 ON bia3.awb_item_id = ah3.awb_item_id AND bia3.awb_number = dohd.awb_number
            AND bia3.is_deleted = FALSE
          ORDER BY
            ah3.history_date DESC
          LIMIT 1
        ) AS last_status ON TRUE
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('bag.branch_id IS NOT NULL AND (bag.is_sortir IS NULL OR bag.is_sortir = FALSE)');

    q.groupByRaw(`
      br.branch_name,
      br.branch_code,
      br.branch_id,
      c.city_name,
      doh.created_time::DATE,
      doh.branch_id
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubTotalProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async getLebihSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubTotalProblemVm> {
    const statusProblemStr = (await this.getListStatusAwbProblem()).join(',');

    payload.fieldResolverMap['createdTime'] = '"doh"."created_time"::DATE';
    payload.fieldResolverMap['scanDate'] = 'doh.created_time';
    payload.fieldResolverMap['branchIdFrom'] = 'br.branch_id';
    payload.fieldResolverMap['branchNameFrom'] = 'br.branch_name';
    payload.fieldResolverMap['branchIdTo'] = 'scan_out.branch_id';
    payload.fieldResolverMap['branchNameTo'] = 'scan_out.branch_name';
    payload.fieldResolverMap['awbNumber'] = 'dohd.awb_number';
    payload.fieldResolverMap['bagNumber'] = 'doh.bag_number';
    payload.fieldResolverMap['bagSortir'] = 'bag_sortir.bag_number';
    payload.fieldResolverMap['bagSeqSortir'] = 'bag_sortir.bag_seq';
    payload.fieldResolverMap['cityId'] = 'c.city_id';

    payload.globalSearchFields = [
      {
        field: 'scan_out.branch_name',
      },
    ];
    payload = this.formatPayloadFiltersAwbProblem(payload);

    const repo = new OrionRepositoryService(Bag, 'bag');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`MAX(dohd.created_time)`, 'scanDate'],
      [`dohd.awb_number`, 'awbNumber'],
      [`CASE
          WHEN bag_sortir.bag_number IS NOT NULL AND scan_out.awb_id IS NOT NULL AND last_status.awb_status_id NOT IN (${statusProblemStr})
            THEN CONCAT(bag_sortir.bag_number, LPAD(bag_sortir.bag_seq::text, 3, '0'))
          ELSE doh.bag_number
        END`, 'bagNumber'],
      [`CASE WHEN
        dohd.awb_number IS NULL THEN 'Yes'
        ELSE 'No'
        END`, 'do'],
      [`CASE WHEN bag_sortir.bag_number IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'in'],
      [`CASE WHEN scan_out.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'out'],
      [`last_status.awb_status_name`, 'awbStatusName'],
    );
    q.innerJoinRaw(
      'bag_item',
      'bi',
      `
        bi.bag_id = bag.bag_id AND bi.is_deleted = FALSE
        LEFT JOIN dropoff_hub doh ON doh.bag_id = bag.bag_id AND doh.is_deleted = FALSE and doh.branch_id IS NOT NULL
        LEFT JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
        INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
        INNER JOIN branch br ON br.branch_id = dohd.branch_id_to AND br.is_deleted = FALSE
        INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
        INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE
        LEFT JOIN LATERAL
        (
          SELECT
            bi1.bag_seq,
            ai1.awb_id,
            b1.bag_number,
            bi1.created_time,
            c1.city_name,
            c1.city_id,
            br1.branch_name,
            br1.branch_code,
            br1.branch_id
          FROM bag_item_awb bia1
          INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE
          INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
          INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE AND b1.branch_id_to IS NOT NULL
          INNER JOIN branch br1 ON br1.branch_id = b1.branch_id_to AND br1.is_deleted = FALSE
          INNER JOIN district d1 ON d1.district_id = br1.district_id AND d1.is_deleted = FALSE
          INNER JOIN city c1 ON c1.city_id = d1.city_id AND c1.is_deleted = FALSE
          WHERE bia1.is_deleted = FALSE AND bia1.awb_number = bia.awb_number
        ) AS bag_sortir ON true
        INNER JOIN LATERAL (
          SELECT
            ai2.awb_id,
            dpdb2.bag_number,
            dpdb2.created_time
          FROM do_pod dp2
          INNER JOIN do_pod_detail_bag dpdb2 ON dpdb2.do_pod_id = dp2.do_pod_id AND dpdb2.is_deleted = FALSE
          INNER JOIN branch br2 ON br2.branch_id = dp2.branch_id_to AND br2.is_deleted = FALSE
          INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE AND bia2.awb_number = bia.awb_number
          INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE
          WHERE
            dp2.is_deleted = FALSE
            AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
            AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
        ) AS scan_out ON true
        INNER JOIN LATERAL (
          SELECT
            ah3.awb_status_id,
            as3.awb_status_name
          FROM
            awb_history ah3
          INNER JOIN bag_item_awb bia3 ON bia3.awb_item_id = ah3.awb_item_id AND bia3.awb_number = dohd.awb_number
          INNER JOIN awb_status as3 ON as3.awb_status_id = ah3.awb_status_id
            AND bia3.is_deleted = FALSE
          ORDER BY
            ah3.history_date DESC
          LIMIT 1
        ) AS last_status ON TRUE
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('bag.branch_id IS NOT NULL AND (bag.is_sortir IS NULL OR bag.is_sortir = FALSE) AND dohd.awb_number IS NULL');

    q.groupByRaw(`
      dohd.awb_number,
      bag_sortir.bag_number,
      bag_sortir.bag_seq,
      doh.bag_number,
      doh.created_time,
      -- br.branch_name,
      scan_out.awb_id,
      doh.branch_id,
      scan_out.branch_id,
      scan_out.branch_name,
      bag.is_manual,
      last_status.awb_status_name,
      last_status.awb_status_id,
      c.city_id
    `);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubTotalProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static formatPayloadFiltersAwbProblem(payload: BaseMetaPayloadVm) {
    const isFilterBagNumber = false;
    let isFilterBagSortir = false;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < payload.filters.length; i++) {
      if (payload.filters[i].field == 'bagSortir') {
        isFilterBagSortir = true;

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
