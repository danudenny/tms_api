import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { POD_TYPE } from '../../../../../shared/constants/pod-type.constant';
import { RequestQueryBuidlerService } from '../../../../../shared/services/request-query-builder.service';
import { BaseMetaPayloadFilterVm, BaseMetaPayloadFilterVmOperator, BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../../shared/services/meta.service';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';

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
    const data = await RawQueryService.query(
      await this.getQueryMonitoringHubBagByFilterOrion(payload),
    );

    let dataBag = [];
    if (data) {
      dataBag = await RawQueryService.query(
        await this.getQueryMonitoringHubTotalBagByFilterOrion(payload),
      );
    }
    const totalDetail = {};
    const keys = Object.keys(dataBag[0]);

    Object.values(dataBag[0]).forEach((v, k) => {
      if (!v) {
        totalDetail[keys[k]] = '0';
      } else {
        totalDetail[keys[k]] = v;
      }
    });

    const result = {
      data,
      paging: MetaService.set(payload.page, payload.limit, dataBag ? dataBag[0].totalData : 0),
      totalDetail,
    };
    return result;
  }

  static async getQueryMonitoringHubBagByFilterOrion(payload: BaseMetaPayloadVm): Promise<string> {
    const mapSubQuery = {
      totalBag: '"totalBag"',
      remaining: '"remaining"',
      totalScanIn: '"totalScanIn"',
      createdTime: 'dp.do_pod_date_time',
      branchIdTo: 'dp.branch_id_to',
      branchIdFrom: 'b.branch_id',
    };
    const map = {
      status: '"status"',
      origin: '"origin"',
    };
    const whereQuerySub = await this.orionFilterToQueryRaw(payload.filters, mapSubQuery, true);
    const whereQuery = await this.orionFilterToQueryRaw(payload.filters, map, true);

    let filterQuery = payload.search ? `origin ~* '${payload.search}'` : '';
    filterQuery += filterQuery && whereQuery ? 'AND' : '';
    filterQuery += whereQuery;

    const query = `
      WITH detail AS (
        SELECT
          "origin",
          "doPodDateTime",
          SUM("totalBag") AS "totalBag",
          SUM("totalScanIn") AS "totalScanIn",
          SUM("totalAwb") AS "totalAwb",
          SUM("totalScanOut") AS "totalScanOut"
        FROM (
          SELECT
            COUNT(DISTINCT dpdb.bag_item_id) As "totalBag",
            br.branch_name As "origin",
            dp.do_pod_id AS "doPodId",
            COUNT(DISTINCT doh.bag_item_id) As "totalScanIn",
            COUNT(bai.*) AS "totalAwb",
            COUNT(DISTINCT bih.bag_item_id) AS "totalScanOut",
            dp.do_pod_date_time AS "doPodDateTime"
          FROM do_pod dp
          INNER JOIN do_pod_detail_bag dpdb ON dp.do_pod_id = dpdb.do_pod_id AND dpdb.is_deleted = FALSE
          LEFT JOIN bag_item_history bih ON bih.bag_item_id = dpdb.bag_item_id AND bih.is_deleted = FALSE
            AND bih.bag_item_status_id = ${BAG_STATUS.OUT_HUB} AND bih.history_date >= dpdb.created_time::DATE
          LEFT JOIN dropoff_hub doh ON doh.bag_item_id = dpdb.bag_item_id AND doh.is_deleted = FALSE
          LEFT JOIN bag_item bi ON bi.bag_item_id = dpdb.bag_item_id AND bi.is_deleted = FALSE
          LEFT JOIN bag_item_awb bai ON bai.bag_item_id = bi.bag_item_id AND bai.is_deleted = FALSE
          INNER JOIN bag b ON b.bag_id = dpdb.bag_id AND b.is_deleted = FALSE
          INNER JOIN branch br ON br.branch_id = b.branch_id AND br.is_deleted = FALSE
          WHERE
            dp.is_deleted = FALSE
            AND dp.do_pod_type = 3005
            ${whereQuerySub ? `AND ${whereQuerySub}` : ''}
          GROUP BY br.branch_name, dp.do_pod_id
        ) t1
        GROUP BY "origin", "doPodId", "doPodDateTime"
      )
      SELECT * FROM (
        SELECT
          TO_CHAR("doPodDateTime", \'DD Mon YYYY HH24:MI\') AS "doPodDateTime",
          "origin",
          CASE
            WHEN "totalScanIn" = "totalBag" AND "totalScanIn" > 0
              THEN 'Hub'
            WHEN "totalScanIn" < "totalBag" AND "totalScanIn" > 0
              THEN 'Unload'
            else
              'Delivery'
          END "status",
          "totalBag",
          "totalAwb",
          "totalScanIn",
          "totalBag" - "totalScanIn" AS "remaining",
          "totalScanOut"
        FROM detail
      ) t1
      ${filterQuery ? `WHERE ${filterQuery}` : ''}
      ${payload.sortBy && {...mapSubQuery, ...map}[payload.sortBy] ?
        `ORDER BY ${{...mapSubQuery, ...map}[payload.sortBy]} ${payload.sortDir}, "remaining" DESC` :
        `ORDER BY
          CASE WHEN "status" = 'Delivery' then 1
            WHEN "status" = 'Unload' then 2
            WHEN "status" = 'Hub' then 3
          END,
          "remaining" desc`}
      LIMIT ${payload.limit}
      ${payload.page ? `OFFSET ${payload.limit * (Number(payload.page) - 1)}` : ''};
    `;
    return query;
  }

  static async getQueryMonitoringHubTotalBagByFilterOrion(payload: BaseMetaPayloadVm): Promise<string> {
    const map = {
      createdTime: 'dp.do_pod_date_time',
      branchIdTo: 'dp.branch_id_to',
      branchIdFrom: 'b.branch_id',
      origin: 'br.branch_name',
    };
    const whereQuery = await this.orionFilterToQueryRaw(payload.filters, map, true);

    const query = `
    WITH detail as (
      SELECT
        COUNT(DISTINCT dpdb.bag_item_id) AS "totalBag",
        dp.do_pod_id AS "doPodId",
        COUNT(DISTINCT doh.bag_item_id) AS "totalScanIn"
      FROM
        do_pod dp
      INNER JOIN do_pod_detail_bag dpdb ON dp.do_pod_id = dpdb.do_pod_id
        AND dpdb.is_deleted = FALSE
      LEFT JOIN dropoff_hub doh ON doh.bag_item_id = dpdb.bag_item_id
        AND doh.is_deleted = FALSE
      INNER JOIN bag b ON b.bag_id = dpdb.bag_id
        AND b.is_deleted = FALSE
      INNER JOIN branch br ON br.branch_id = b.branch_id
        AND br.is_deleted = FALSE
      WHERE
        dp.is_deleted = FALSE
        AND dp.do_pod_type = ${POD_TYPE.OUT_BRANCH}
        ${whereQuery ? `AND ${whereQuery}` : ''}
        ${payload.search ? `AND br.branch_name ~* '${payload.search}'` : ''}
      GROUP BY
        br.branch_name, dp.do_pod_id
    )
    SELECT
      COUNT("totalBag") AS "totalData",
      COUNT(DISTINCT "doPodId") AS "totalDoBag",
      SUM("totalBag") AS "totalBag",
      SUM("totalHub") AS "totalHub",
      SUM("totalUnload") AS "totalUnload",
      SUM("totalDelivery") AS "totalDelivery",
      SUM("totalDoHub") AS "totalDoHub",
      SUM("totalDoUnload") AS "totalDoUnload",
      SUM("totalDoDelivery") AS "totalDoDelivery"
    FROM
      (
        SELECT
          "totalBag" AS "totalBag",
					"doPodId" AS "doPodId",
          CASE
            WHEN "totalScanIn" = "totalBag"
            AND "totalScanIn" > 0 THEN
              "totalBag"
          END "totalHub",
          CASE
            WHEN "totalScanIn" = "totalBag"
            AND "totalScanIn" > 0 THEN 1
          END "totalDoHub",
          CASE
              WHEN "totalScanIn" < "totalBag"
              AND "totalScanIn" > 0 THEN
                "totalBag"
          END "totalUnload",
          CASE
            WHEN "totalScanIn" < "totalBag"
            AND "totalScanIn" > 0 THEN 1
          END "totalDoUnload",
          CASE
              WHEN "totalScanIn" = 0 THEN
                "totalBag"
          END "totalDelivery",
          CASE
            WHEN "totalScanIn" = 0 THEN 1
          END "totalDoDelivery"
        FROM detail
      ) t1;
    `;
    return query;
  }

  static async orionFilterToQueryRaw(
    filters: BaseMetaPayloadFilterVm[],
    map: any,
    ignoreUnmapping = false,
  ): Promise<string> {
    let query = '';
    for (const filter of filters) {
      const opt = RequestQueryBuidlerService
        .convertFilterOperatorToSqlOperator(filter.operator as BaseMetaPayloadFilterVmOperator);
      const field = map[filter.field];
      if (!field && ignoreUnmapping || filter.value === '') {
        continue;
      }
      let str = `${field} ${opt} '${filter.value}'`;
      if (opt == 'LIKE') {
        str = `${field} ${opt} '%${filter.value}%'`;
      }
      query += query ? `AND ${str}\n` : `${str}\n`;
    }
    return query;
  }
}
