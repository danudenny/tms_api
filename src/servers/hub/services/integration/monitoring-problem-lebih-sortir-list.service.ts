import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm, BaseMetaPayloadFilterVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { MonitoringHubProblemVm, MonitoringHubTotalProblemVm, MonitoringHubProblemLebihSortirVm } from '../../models/monitoring-hub-problem.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { MonitoringProblemListService } from './monitoring-problem-list.service';

@Injectable()
export class MonitoringProblemLebihSortirListService {

  static async getLebihSortir(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringHubProblemVm> {
    const statusProblemStr = (await MonitoringProblemListService.getListStatusAwbProblem()).join(',');

    payload.fieldResolverMap['scanDate'] = '"bi"."created_time"::DATE';
    payload.fieldResolverMap['scanDateInHub'] = '"bi"."created_time"::DATE';
    payload.fieldResolverMap['createdTime'] = '"bi"."created_time"::DATE';
    payload.fieldResolverMap['branchIdFrom'] = 'bag_sortir.branch_id';
    payload.fieldResolverMap['branchNameFrom'] = 'bag_sortir.branch_name';
    payload.fieldResolverMap['branchId'] = 'bag_sortir.branch_id';
    payload.fieldResolverMap['branchName'] = 'bag_sortir.branch_name';
    payload.fieldResolverMap['awbNumber'] = 'bag_sortir.awb_number';
    payload.fieldResolverMap['bagNumber'] = 'bag_sortir.bag_number';
    payload.fieldResolverMap['bagSortir'] = 'bag_sortir.bag_number';
    payload.fieldResolverMap['bagSeqSortir'] = 'bag_sortir.bag_seq';
    payload.fieldResolverMap['cityId'] = 'bag_sortir.city_id';

    payload.globalSearchFields = [
      {
        field: 'bag_sortir.branch_name',
      },
    ];
    payload = this.formatPayloadFiltersAwbProblem(payload);

    const repo = new OrionRepositoryService(Bag, 'bag');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);
    q.selectRaw(
      [`bag_sortir.created_time`, 'scanDateInHub'],
      [`bag_sortir.awb_number`, 'awbNumber'],
      [`CONCAT(bag_sortir.bag_number, LPAD(bag_sortir.bag_seq::text, 3, '0'))`, 'bagNumber'],
      ['\'No\'::text', 'do'],
      [`CASE WHEN bag_sortir.bag_number IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'in'],
      [`CASE WHEN scan_out.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'out'],
      [`last_status.awb_status_name`, 'awbStatusName'],
    );
    q.innerJoinRaw(
      'bag_item',
      'bi',
      `
        bi.bag_id = bag.bag_id AND bi.is_deleted = FALSE
        LEFT JOIN dropoff_hub doh ON doh.bag_id = bag.bag_id AND doh.is_deleted = FALSE
        -- AND doh.branch_id IS NOT NULL
        LEFT JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        INNER JOIN LATERAL (
          SELECT *
          FROM bag_item_awb bia00
          WHERE bia00.bag_item_id = bi.bag_item_id
            AND bia00.is_deleted = FALSE
          ORDER BY bia00.bag_item_awb_id ASC
          LIMIT 1
        ) AS bia ON TRUE
        INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
        INNER JOIN LATERAL (
          SELECT
            bi1.bag_seq,
            ai1.awb_id,
            b1.bag_number,
            bi1.created_time,
            br1.branch_code,
            br1.branch_name,
            br1.branch_id,
            c1.city_name,
            c1.city_id,
            bia.awb_number
          FROM bag_item_awb bia1
          INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE
          INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
          INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE
          -- AND b1.branch_id_to IS NOT NULL
          INNER JOIN branch br1 ON br1.branch_id = b1.branch_id AND br1.is_deleted = FALSE
          INNER JOIN district d1 ON d1.district_id = br1.district_id AND d1.is_deleted = FALSE
          INNER JOIN city c1 ON c1.city_id = d1.city_id AND c1.is_deleted = FALSE
          WHERE bia1.is_deleted = FALSE
            AND bia1.awb_number = bia.awb_number
        ) AS bag_sortir ON TRUE
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
         	WHERE dp2.is_deleted = FALSE AND dp2.do_pod_type = 3010
         		AND dp2.user_id_driver IS NOT NULL
         		AND dp2.branch_id_to IS NOT NULL
        ) AS scan_out ON TRUE
        LEFT JOIN LATERAL (
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
    q.andWhereRaw(`
      dohd.awb_number is null
    `);
    q.groupByRaw(`
      bag_sortir.awb_number,
      bi.created_time::DATE,
      bag_sortir.bag_number,
      bag_sortir.bag_seq,
      bag_sortir.bag_number,
      bag_sortir.created_time,
      last_status.awb_status_name,
      bag_sortir.city_id,
      scan_out.awb_id
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
    const statusProblemStr = (await MonitoringProblemListService.getListStatusAwbProblem()).join(',');

    payload.fieldResolverMap['scanDate'] = '"bi"."created_time"::DATE';
    payload.fieldResolverMap['scanDateInHub'] = '"bi"."created_time"::DATE';
    payload.fieldResolverMap['branchIdFrom'] = 'bag_sortir.branch_id';
    payload.fieldResolverMap['branchNameFrom'] = 'bag_sortir.branch_name';
    payload.fieldResolverMap['branchId'] = 'bag_sortir.branch_id';
    payload.fieldResolverMap['branchName'] = 'bag_sortir.branch_name';
    payload.fieldResolverMap['awbNumber'] = 'bag_sortir.awb_number';
    payload.fieldResolverMap['bagNumber'] = 'bag_sortir.bag_number';
    payload.fieldResolverMap['bagSortir'] = 'bag_sortir.bag_number';
    payload.fieldResolverMap['bagSeqSortir'] = 'bag_sortir.bag_seq';
    payload.fieldResolverMap['cityId'] = 'bag_sortir.city_id';

    payload.globalSearchFields = [
      {
        field: 'bag_sortir.branch_name',
      },
    ];
    payload = this.formatPayloadFiltersAwbProblem(payload);

    const repo = new OrionRepositoryService(Bag, 'bag');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`bi.created_time::DATE`, 'scanDateInHub'],
      [`bag_sortir.city_name`, 'cityName'],
      [`bag_sortir.city_id`, 'cityId'],
      [`bag_sortir.branch_name`, 'branchName'],
      [`bag_sortir.branch_code`, 'branchCode'],
      [`bag_sortir.branch_id`, 'branchId'],
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
      LEFT JOIN dropoff_hub doh ON doh.bag_id = bag.bag_id AND doh.is_deleted = FALSE
      -- AND doh.branch_id IS NOT NULL
      LEFT JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
      INNER JOIN LATERAL (
        SELECT *
        FROM bag_item_awb bia00
        WHERE bia00.bag_item_id = bi.bag_item_id
          AND bia00.is_deleted = FALSE
        ORDER BY bia00.bag_item_awb_id ASC
        LIMIT 1
      ) AS bia ON TRUE
      INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
      INNER JOIN LATERAL (
        SELECT
          bi1.bag_seq,
          ai1.awb_id,
          b1.bag_number,
          bi1.created_time,
          br1.branch_code,
          br1.branch_name,
          br1.branch_id,
          c1.city_name,
          c1.city_id,
          bia.awb_number
        FROM bag_item_awb bia1
        INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE
        INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
        INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE
        -- AND b1.branch_id_to IS NOT NULL
        INNER JOIN branch br1 ON br1.branch_id = b1.branch_id AND br1.is_deleted = FALSE
        INNER JOIN district d1 ON d1.district_id = br1.district_id AND d1.is_deleted = FALSE
        INNER JOIN city c1 ON c1.city_id = d1.city_id AND c1.is_deleted = FALSE
        WHERE bia1.is_deleted = FALSE
          AND bia1.awb_number = bia.awb_number
      ) AS bag_sortir ON TRUE
    `);

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw(`
      dohd.awb_number is null
    `);

    q.groupByRaw(`
      bag_sortir.branch_name,
      bag_sortir.branch_code,
      bag_sortir.branch_id,
      bag_sortir.city_name,
      bag_sortir.city_id,
      bi.created_time::DATE,
      bag_sortir.awb_number
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
