import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { POD_TYPE } from '../../../../../shared/constants/pod-type.constant';
import { RequestQueryBuidlerService } from '../../../../../shared/services/request-query-builder.service';
import { BaseMetaPayloadFilterVm, BaseMetaPayloadFilterVmOperator, BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../../shared/services/meta.service';

export class HubMonitoringService {

  /**
   * Monitoring Delivery Bag - HUB
   */
  static async monitoringBagHub(
    payload: BaseMetaPayloadVm,
  ): Promise<any> {
    // const authMeta = AuthService.getAuthData();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
    if (!payload.limit) {
      payload.limit = 10;
    }
    if (!payload.sortBy) {
      payload.sortBy = 'origin';
    }
    const data =
    await RawQueryService.query(
      await this.getQueryMonitoringHubBagByFilterOrion(payload),
    );

    const totalData = await RawQueryService.query(
      await this.getQueryMonitoringHubBagByFilterOrion(payload, true),
    );
    const result = {
      data,
      paging: MetaService.set(payload.page, payload.limit, totalData[0].cnt),
    };
    return result;
  }

  static async getQueryMonitoringHubBagByFilterOrion(payload: BaseMetaPayloadVm, isQueryCount = false): Promise<string> {
    const map = {
      origin: '"origin"',
      totalBag: '"totalBag"',
      totalScanIn: '"totalScanIn"',
      createdTime: 'dp.do_pod_date_time',
      branchIdTo: 'dp.branch_id_to',
      status: 'status',
    };
    const whereQuery = await this.orionFilterToQueryRaw(payload.filters, map);

    let query = `
      SELECT
        "origin",
        SUM("totalBag") AS "totalBag",
        SUM("totalScanIn") AS "totalScanIn",
        SUM("totalBag") - SUM("totalScanIn") AS "remaining",
        CASE
          WHEN SUM("totalScanIn") = SUM("totalBag") AND SUM("totalScanIn") > 0
            THEN 'Hub'
          WHEN SUM("totalScanIn") < SUM("totalBag") AND SUM("totalScanIn") > 0
            THEN 'Unload'
          else
            'Delivery'
        END status
      FROM (
        SELECT
          COUNT(DISTINCT dpdb.bag_item_id) As "totalBag",
          br.branch_name As "origin",
          COUNT(DISTINCT doh.bag_item_id) As "totalScanIn"
        FROM do_pod dp
        INNER JOIN do_pod_detail_bag dpdb ON dp.do_pod_id = dpdb.do_pod_id AND dpdb.is_deleted = FALSE
        LEFT JOIN dropoff_hub doh ON doh.bag_item_id = dpdb.bag_item_id AND doh.is_deleted = FALSE
        INNER JOIN bag b ON b.bag_id = dpdb.bag_id AND b.is_deleted = FALSE
        INNER JOIN branch br ON br.branch_id = b.branch_id AND br.is_deleted = FALSE
        where
          dp.is_deleted = FALSE
          AND dp.do_pod_type = ${POD_TYPE.OUT_BRANCH}
          ${whereQuery ? `AND ${whereQuery}` : ''}
        group by br.branch_name
      ) t1
      ${payload.search ? `WHERE origin ~* '${payload.search}'` : ''}
      group by "origin"
      ${isQueryCount ? '' : `ORDER BY ${map[payload.sortBy]} ${payload.sortDir}\nLIMIT ${payload.limit};`}
    `;

    if (isQueryCount) {
      query = `SELECT COUNT (*) AS cnt FROM ( ${query} ) t;`;
    }
    return query;
  }

  static async orionFilterToQueryRaw(
    filters: BaseMetaPayloadFilterVm[],
    map: any,
  ): Promise<string> {
    let query = '';
    for (const filter of filters) {
      const opt = RequestQueryBuidlerService
        .convertFilterOperatorToSqlOperator(filter.operator as BaseMetaPayloadFilterVmOperator);
      const field = map[filter.field];
      query += query ? `AND ${field} ${opt} '${filter.value}'\n` : `${field} ${opt} '${filter.value}'\n`;
    }
    return query;
  }
}
