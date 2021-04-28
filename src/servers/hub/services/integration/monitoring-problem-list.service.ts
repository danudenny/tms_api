import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DropoffHub } from '../../../../shared/orm-entity/dropoff_hub';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { MonitoringHubProblemVm, MonitoringHubTotalProblemVm } from '../../models/monitoring-hub-problem.vm';

@Injectable()
export class MonitoringProblemListService {
  static async getDoHub(
    payload: BaseMetaPayloadVm,
    isManual = null,
    isProblem = null,
  ): Promise<MonitoringHubProblemVm> {

    payload.fieldResolverMap['createdTime'] = 'dohd.created_time';
    payload.fieldResolverMap['scanDate'] = 'dohd.created_time';
    payload.fieldResolverMap['branchIdFrom'] = 'doh.branch_id';
    payload.fieldResolverMap['branchIdTo'] = 'scan_out.branch_id';
    payload.fieldResolverMap['branchTo'] = 'scan_out.branch_name';
    payload.fieldResolverMap['awbNumber'] = 'dohd.awb_number';
    payload.fieldResolverMap['bagNumber'] = '"bagNumber"';

    payload.globalSearchFields = [
      {
        field: 'scan_out.branch_name',
      },
    ];

    if (!payload.sortBy) {
      payload.sortBy = 'createdTime';
    }

    const repo = new OrionRepositoryService(DropoffHub, 'doh');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      [`MAX(dohd.created_time)`, 'scanDate'],
      [`dohd.awb_number`, 'awbNumber'],
      [`CASE
          WHEN bag_sortir.bag_number IS NOT NULL THEN CONCAT(bag_sortir.bag_number, LPAD(bag_sortir.bag_seq::text, 3, '0'))
          ELSE doh.bag_number
        END`, 'bagNumber'],
      // [`br.branch_name`, 'branchName'],
      [`CASE WHEN bag_sortir.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'in'],
      [`CASE WHEN scan_out.awb_id IS NOT NULL THEN 'Yes' ELSE 'No' END`, 'out'],
      // [`bag.is_manual`, 'isManual'],
    );

    if (isManual === false) {
      q.andWhereRaw('bag.is_manual = false');
      q.andWhereRaw('bag_sortir.awb_id IS NOT NULL');
    } else if (isManual === true) {
      q.andWhereRaw('bag.is_manual = false');
      q.andWhereRaw('bag_sortir.awb_id IS NOT NULL');
    }

    if (isProblem === true) {
      q.andWhereIsolated(qw => {
        qw.whereRaw('bag_sortir.awb_id IS NULL');
        qw.orWhereRaw('scan_out.awb_id IS NULL');
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
        INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        LEFT JOIN LATERAL
        (
          SELECT
            bi1.bag_seq,
            ai1.awb_id,
            b1.bag_number
          FROM bag_item_awb bia1
          INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE AND dohd.awb_id = ai1.awb_id
          INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
          INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE AND b1.branch_id_to IS NOT NULL
          INNER JOIN users u1 ON u1.user_id = bi1.user_id_created AND u1.is_deleted = FALSE
          WHERE bia1.is_deleted = FALSE
        ) AS bag_sortir ON true
        LEFT JOIN LATERAL (
          SELECT
            ai2.awb_id,
            dpdb2.bag_number,
            br2.branch_id,
            br2.branch_name
          FROM do_pod dp2
          INNER JOIN do_pod_detail_bag dpdb2 ON dpdb2.do_pod_id = dp2.do_pod_id AND dpdb2.is_deleted = FALSE
          INNER JOIN branch br2 ON br2.branch_id = dp2.branch_id_to AND br2.is_deleted = FALSE
          INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE
          INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE AND dohd.awb_id = ai2.awb_id
          INNER JOIN users u2 ON u2.user_id = dpdb2.user_id_created AND u2.is_deleted = FALSE
          WHERE
          dp2.is_deleted = FALSE
          AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
          AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
        ) AS scan_out ON true
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('doh.branch_id IS NOT NULL');
    q.groupByRaw(`
      dohd.awb_number,
      bag_sortir.bag_number,
      bag_sortir.bag_seq,
      doh.bag_number,
      -- br.branch_name,
      bag_sortir.awb_id,
      scan_out.awb_id,
      doh.branch_id,
      scan_out.branch_id,
      scan_out.branch_name,
      bag.is_manual
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

    payload.fieldResolverMap['createdTime'] = 'dohd.created_time';
    payload.fieldResolverMap['scanDate'] = 'dohd.created_time';
    payload.fieldResolverMap['branchIdFrom'] = 'doh.branch_id';
    payload.fieldResolverMap['branchNameFrom'] = 'doh.branch_name';
    payload.fieldResolverMap['branchIdTo'] = 'scan_out.branch_id';
    payload.fieldResolverMap['branchNameTo'] = 'scan_out.branch_name';
    payload.fieldResolverMap['awbNumber'] = 'dohd.awb_number';
    payload.fieldResolverMap['bagNumber'] = '"bagNumber"';

    payload.globalSearchFields = [
      {
        field: 'scan_out.branch_name',
      },
    ];

    const repo = new OrionRepositoryService(DropoffHub, 'doh');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);
    q.selectRaw(
      [`br.branch_name`, 'branchName'],
      [`br.branch_code`, 'branchCode'],
      [`c.city_name`, 'cityName'],
      [`COUNT(
          DISTINCT CASE
            WHEN (bag_sortir.awb_id IS NULL OR scan_out.awb_id IS NULL) THEN dohd.awb_number
          END
        )`, 'problem'],
      [`COUNT(
          DISTINCT dohd.awb_number)`, 'doHub'],
      [`COUNT(
          DISTINCT CASE
            WHEN (is_manual = true AND bag_sortir.awb_id IS NOT NULL) THEN dohd.awb_number
        END)`, 'manualSortir'],
      [`COUNT(
          DISTINCT CASE WHEN (is_manual = false AND bag_sortir.awb_id IS NOT NULL)
            THEN dohd.awb_number
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
      'branch',
      'br',
      `
        br.branch_id = doh.branch_id AND br.is_deleted = FALSE
        INNER JOIN district d ON d.district_id = br.district_id AND d.is_deleted = FALSE
        INNER JOIN city c ON c.city_id = d.city_id AND c.is_deleted = FALSE
        INNER JOIN bag bag ON bag.bag_id = doh.bag_id AND bag.is_deleted = FALSE AND bag.branch_id IS NOT NULL AND (is_sortir IS NULL OR is_sortir = FALSE)
        INNER JOIN bag_item bi ON bi.bag_item_id = doh.bag_item_id AND bi.is_deleted = FALSE
        INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
        INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
        LEFT JOIN LATERAL
        (
          SELECT
            bi1.bag_seq,
            ai1.awb_id,
            b1.bag_number,
            bi1.created_time,
            u1.first_name,
            u1.last_name
          FROM bag_item_awb bia1
          INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE AND dohd.awb_id = ai1.awb_id
          INNER JOIN bag_item bi1 ON bi1.bag_item_id = bia1.bag_item_id AND bi1.is_deleted = FALSE
          INNER JOIN bag b1 ON b1.bag_id = bi1.bag_id AND b1.is_deleted = FALSE AND b1.branch_id_to IS NOT NULL
          INNER JOIN users u1 ON u1.user_id = bi1.user_id_created AND u1.is_deleted = FALSE
          WHERE bia1.is_deleted = FALSE
        ) AS bag_sortir ON true
        LEFT JOIN LATERAL (
          SELECT
            ai2.awb_id,
            dpdb2.bag_number,
            br2.branch_id,
            dpdb2.created_time,
            dp2.do_pod_code,
            u2.first_name,
            u2.last_name
          FROM do_pod dp2
          INNER JOIN do_pod_detail_bag dpdb2 ON dpdb2.do_pod_id = dp2.do_pod_id AND dpdb2.is_deleted = FALSE
          INNER JOIN branch br2 ON br2.branch_id = dp2.branch_id_to AND br2.is_deleted = FALSE
          INNER JOIN bag_item_awb bia2 ON bia2.bag_item_id = dpdb2.bag_item_id AND bia2.is_deleted = FALSE
          INNER JOIN awb_item ai2 ON ai2.awb_item_id = bia2.awb_item_id AND ai2.is_deleted = FALSE AND dohd.awb_id = ai2.awb_id
          INNER JOIN users u2 ON u2.user_id = dpdb2.user_id_created AND u2.is_deleted = FALSE
          WHERE
            dp2.is_deleted = FALSE
            AND dp2.do_pod_type = 3010
            AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
        ) AS scan_out ON true
    `);
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('doh.branch_id IS NOT NULL');

    q.groupByRaw(`
      br.branch_name,
      br.branch_code,
      c.city_name
    `);
    const subQuery = q.getQuery();

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MonitoringHubTotalProblemVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
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
}
