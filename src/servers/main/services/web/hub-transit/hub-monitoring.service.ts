  import { RawQueryService } from '../../../../../shared/services/raw-query.service';
  import { POD_TYPE } from '../../../../../shared/constants/pod-type.constant';
  import { RequestQueryBuidlerService } from '../../../../../shared/services/request-query-builder.service';
  import { BaseMetaPayloadFilterVm, BaseMetaPayloadFilterVmOperator, BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
  import { MetaService } from '../../../../../shared/services/meta.service';
  import { RequestErrorService } from '../../../../../shared/services/request-error.service';
  import { HttpStatus } from '@nestjs/common';

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

    static async monitoringSortirHub(
      payload: BaseMetaPayloadVm,
    ): Promise<any> {
      // const authMeta = AuthService.getAuthData();
      // const permissonPayload = AuthService.getPermissionTokenPayload();
      if (!payload.limit) {
        payload.limit = 10;
      }

      const optrDate = ['gte', 'lte', 'lt', 'gt'];
      const checkDateFilter = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, '', optrDate, 'createdTime');

      const optr = ['eq'];
      const checkFilterBranchTo = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, '', optr, 'branchIdTo');
      const checkFilterBranchFrom = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, '', optr, 'branchIdFrom');

      if (!checkFilterBranchTo && !checkFilterBranchFrom) {
        RequestErrorService.throwObj({message: 'Filter Tujuan atau Asal tidak boleh kosong'}, HttpStatus.BAD_REQUEST);
      }
      if (!checkDateFilter) {
        RequestErrorService.throwObj({message: 'Filter Tanggal tidak boleh kosong'}, HttpStatus.BAD_REQUEST);
      }

      const data = await RawQueryService.query(
        await this.getQueryMonitoringSortirListByFilterOrion(payload),
      );

      let dataBag = [];
      if (data) {
        dataBag = await RawQueryService.query(
          await this.getQueryMonitoringSortirTotalByFilterOrion(payload),
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
        branchIdTo: ['dp.branch_id_to', 'bi.branch_id_last'],
        branchIdFrom: 'b.branch_id',
      };
      const map = {
        status: '"status"',
        origin: '"origin"',
      };
      const map1 = {
        createdTime: 'dp.do_pod_date_time',
      };
      const optr = ['gte', 'gt'];
      const optrScanOut = ['eq'];
      const whereQuerySub = await this.customQueryRawFromMultipleFieldsByOrionFilters(payload.filters, mapSubQuery, 'branchIdTo', 'OR');
      const whereQuery = await this.orionFilterToQueryRaw(payload.filters, map, true);
      // const whereSubQueryScanOut2 = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dp0.do_pod_date_time', optr, 'createdTime');
      const whereSubQueryScanOut = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dp0.branch_id', optrScanOut, 'branchIdFrom');

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
              COUNT(DISTINCT bai.bag_item_awb_id) AS "totalAwb",
              COUNT(DISTINCT scan_out.bag_item_id) AS "totalScanOut",
              dp.do_pod_date_time AS "doPodDateTime"
            FROM do_pod dp
            INNER JOIN do_pod_detail_bag dpdb ON dp.do_pod_id = dpdb.do_pod_id AND dpdb.is_deleted = FALSE
            LEFT JOIN LATERAL (
              SELECT dpdb0.bag_item_id
              FROM do_pod dp0
              INNER JOIN do_pod_detail_bag dpdb0 ON dpdb0.do_pod_id = dp0.do_pod_id AND dpdb0.is_deleted = FALSE AND dpdb.bag_item_id = dpdb0.bag_item_id
              WHERE
                dp0.is_deleted = FALSE
                AND dp0.branch_id_to IS NOT NULL
                AND do_pod_type = ${POD_TYPE.OUT_HUB_TRANSIT}
                AND dp0.user_id_driver IS NOT NULL AND dp0.branch_id_to IS NOT NULL
                ${whereSubQueryScanOut ? `AND ${whereSubQueryScanOut}` : ''}
            ) scan_out ON true
            LEFT JOIN dropoff_hub doh ON doh.bag_item_id = dpdb.bag_item_id AND doh.is_deleted = FALSE
            LEFT JOIN bag_item bi ON bi.bag_item_id = dpdb.bag_item_id AND bi.is_deleted = FALSE
            LEFT JOIN bag_item_awb bai ON bai.bag_item_id = bi.bag_item_id AND bai.is_deleted = FALSE
            INNER JOIN bag b ON b.bag_id = dpdb.bag_id AND b.is_deleted = FALSE
            INNER JOIN branch br ON br.branch_id = b.branch_id AND br.is_deleted = FALSE
            WHERE
              dp.is_deleted = FALSE
              AND dp.do_pod_type = ${POD_TYPE.OUT_BRANCH}
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
        branchIdTo: ['dp.branch_id_to', 'bi.branch_id_last'],
        branchIdFrom: 'b.branch_id',
        origin: 'br.branch_name',
      };
      const whereQuery = await this.customQueryRawFromMultipleFieldsByOrionFilters(payload.filters, map, 'branchIdTo', 'OR');

      const query = `
      WITH detail as (
        SELECT
          COUNT(DISTINCT dpdb.bag_item_id) AS "totalBag",
          dp.do_pod_id AS "doPodId",
          COUNT(DISTINCT doh.bag_item_id) AS "totalScanIn"
        FROM
          do_pod dp
        INNER JOIN do_pod_detail_bag dpdb ON dp.do_pod_id = dpdb.do_pod_id AND dpdb.is_deleted = FALSE
        LEFT JOIN dropoff_hub doh ON doh.bag_item_id = dpdb.bag_item_id AND doh.is_deleted = FALSE
        INNER JOIN bag b ON b.bag_id = dpdb.bag_id AND b.is_deleted = FALSE
        INNER JOIN bag_item bi ON bi.bag_item_id = dpdb.bag_item_id AND bi.is_deleted = FALSE
        INNER JOIN branch br ON br.branch_id = b.branch_id AND br.is_deleted = FALSE
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

    static async getQueryMonitoringSortirTotalByFilterOrion(payload: BaseMetaPayloadVm): Promise<string> {
      const map = {
        createdTime: 'doh.created_time',
        branchIdFrom: 'doh.branch_id',
        branchIdTo: 'scan_out.branch_id',
        branchTo: 'scan_out.branch_name',
      };
      const optr = ['gte', 'gt'];
      const optrScanOut = ['eq'];
      const whereQuery = await this.orionFilterToQueryRaw(payload.filters, map, true);
      const whereSubQuery = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'bi.created_time', optr, 'createdTime');
      // const whereSubQueryScanOut2 = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dp1.do_pod_date_time', optrScanOut, 'createdTime');
      const whereSubQueryScanOut = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dp1.branch_id', optrScanOut, 'branchIdFrom');

      const query = `
        WITH detail as (
          SELECT
            scan_out.branch_name AS "branchTo",
            scan_out.do_pod_id AS "doPodId",
            COUNT(DISTINCT dohd.awb_item_id) AS "awbItemId",
            COUNT(DISTINCT bag_sortir.awb_id) AS "awbSortir",
            COUNT(DISTINCT scan_out.awb_id) AS "awbScanOutBagSortir"
          FROM
            dropoff_hub doh
          INNER JOIN bag bag ON bag.bag_id = doh.bag_id AND bag.is_deleted = FALSE AND bag.branch_id IS NOT NULL
          INNER JOIN bag_item bi ON bi.bag_item_id = doh.bag_item_id AND bi.is_deleted = FALSE
          INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
          INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
          LEFT JOIN LATERAL
          (
            SELECT
              ai0.awb_id,
              bi0.bag_item_id,
              bi0.branch_id_last
            FROM
              bag_item_awb bia0
              INNER JOIN awb_item ai0 ON ai0.awb_item_id = bia0.awb_item_id AND ai0.is_deleted = FALSE AND dohd.awb_id = ai0.awb_id
              INNER JOIN bag_item bi0 ON bi0.bag_item_id = bia0.bag_item_id AND bi0.is_deleted = FALSE
              INNER JOIN bag b0 ON b0.bag_id = bi0.bag_id AND b0.is_deleted = FALSE AND b0.branch_id_to IS NOT NULL
            WHERE bia0.is_deleted = FALSE
          ) bag_sortir ON true
          LEFT JOIN LATERAL (
            SELECT ai1.awb_id, dp1.do_pod_id, br1.branch_name, br1.branch_id
            FROM do_pod dp1
            INNER JOIN do_pod_detail_bag dpdb1 ON dpdb1.do_pod_id = dp1.do_pod_id AND dpdb1.is_deleted = FALSE
            INNER JOIN bag_item_awb bia1 ON bia1.bag_item_id = dpdb1.bag_item_id AND bia1.is_deleted = FALSE
            INNER JOIN branch br1 ON br1.branch_id = dp1.branch_id_to AND br1.is_deleted = FALSE
            INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE AND dohd.awb_id = ai1.awb_id
            WHERE
              dp1.is_deleted = FALSE
              AND do_pod_type = ${POD_TYPE.OUT_HUB}
              AND dp1.user_id_driver IS NOT NULL AND dp1.branch_id_to IS NOT NULL
              ${whereSubQueryScanOut ? `AND ${whereSubQueryScanOut}` : ''}
          ) scan_out ON true
          WHERE
            doh.branch_id IS NOT NULL
            ${whereQuery ? `AND ${whereQuery}` : ''}
            ${payload.search ? `AND scan_out.branch_name ~* '${payload.search}'` : ''}
          GROUP BY
            scan_out.branch_name, scan_out.do_pod_id
        )
        SELECT *, "totalBag" - (COALESCE("totalScanOutBagSortir", 0) + COALESCE("totalBagSortir", 0)) AS "totalSort" FROM (
          SELECT
            SUM("totalBag") AS "totalBag",
            SUM("totalScanOutBagSortir") AS "totalScanOutBagSortir",
            SUM("totalBagSortir") AS "totalBagSortir",
            SUM("totalData") AS "totalData"
          FROM (
            SELECT
              SUM("awbItemId") AS "totalBag",
              SUM("awbScanOutBagSortir") AS "totalScanOutBagSortir",
              SUM(CASE WHEN "doPodId" IS NULL THEN "awbSortir" END) AS "totalBagSortir",
              COUNT(DISTINCT CASE WHEN "branchTo" IS NULL THEN '1' ELSE "branchTo" END) AS "totalData"
            FROM detail
            GROUP BY "branchTo", "doPodId"
          ) t1
        ) t2
      `;
      return query;
    }

    static async getQueryMonitoringSortirListByFilterOrion(payload: BaseMetaPayloadVm): Promise<string> {
      const map = {
        createdTime: 'doh.created_time',
        branchIdFrom: 'doh.branch_id',
        branchIdTo: 'scan_out.branch_id',
        branchTo: 'scan_out.branch_name',
      };
      const sortingMap = {
        createdTime : '"createdTime"',
        branchTo : '"branchTo"',
        status : '"status"',
        totalBagSortir : '"totalBagSortir"',
        totalAwb : '"totalAwb"',
        totalScanInAwb : '"totalScanInAwb"',
        remainingAwbSortir : '"remainingAwbSortir"',
        totalScanOutBagSortir : '"totalScanOutBagSortir"',
      };
      const optr = ['gte', 'gt'];
      const whereQuery = await this.orionFilterToQueryRaw(payload.filters, map, true);
      // const whereSubQuery = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'bi1.created_time', optr, 'createdTime');
      // const whereSubQueryScanOut = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dp2.do_pod_date_time', optr, 'createdTime');

      let filterQuery = payload.search ? `origin ~* '${payload.search}'` : '';
      filterQuery += filterQuery && whereQuery ? 'AND' : '';
      filterQuery += whereQuery;

      const query = `
        WITH detail as (
          SELECT
            scan_out.branch_name AS "branchTo",
            scan_out.do_pod_code AS "doPodCode",
            MIN(doh.created_time) AS "createdTime",
            COUNT(DISTINCT dohd.awb_item_id) AS "awbHub",
            COUNT(DISTINCT CASE WHEN scan_out.awb_id IS NULL THEN bag_sortir.awb_id END) AS "awbScanIn",
            COUNT(DISTINCT scan_out.awb_id) AS "awbScanOutBagSortir"
          FROM
            dropoff_hub doh
          INNER JOIN bag bag ON bag.bag_id = doh.bag_id AND bag.is_deleted = FALSE AND bag.branch_id IS NOT NULL
          INNER JOIN bag_item bi ON bi.bag_item_id = doh.bag_item_id AND bi.is_deleted = FALSE
          INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
          INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
          LEFT JOIN LATERAL
          (
            SELECT
              bi0.created_time,
              ai0.awb_id,
              bi0.bag_item_id,
              bi0.branch_id_last
            FROM bag_item_awb bia0
            INNER JOIN awb_item ai0 ON ai0.awb_item_id = bia0.awb_item_id AND ai0.is_deleted = FALSE AND dohd.awb_id = ai0.awb_id
            INNER JOIN bag_item bi0 ON bi0.bag_item_id = bia0.bag_item_id AND bi0.is_deleted = FALSE
            INNER JOIN bag b0 ON b0.bag_id = bi0.bag_id AND b0.is_deleted = FALSE AND b0.branch_id_to IS NOT NULL
            WHERE bia0.is_deleted = FALSE
          ) bag_sortir ON true
          LEFT JOIN LATERAL (
            SELECT ai1.awb_id, dp1.do_pod_code, br1.branch_name, br1.branch_id
            FROM do_pod dp1
            INNER JOIN do_pod_detail_bag dpdb1 ON dpdb1.do_pod_id = dp1.do_pod_id AND dpdb1.is_deleted = FALSE
            INNER JOIN branch br1 ON br1.branch_id = dp1.branch_id_to AND br1.is_deleted = FALSE
            INNER JOIN bag_item_awb bia1 ON bia1.bag_item_id = dpdb1.bag_item_id AND bia1.is_deleted = FALSE
            INNER JOIN awb_item ai1 ON ai1.awb_item_id = bia1.awb_item_id AND ai1.is_deleted = FALSE AND dohd.awb_id = ai1.awb_id
            WHERE
              dp1.is_deleted = FALSE
              AND dp1.do_pod_type = ${POD_TYPE.OUT_HUB}
              AND dp1.user_id_driver IS NOT NULL AND dp1.branch_id_to IS NOT NULL
          ) scan_out ON true
          WHERE
            doh.branch_id IS NOT NULL
            ${whereQuery ? `AND ${whereQuery}` : ''}
            ${payload.search ? `AND scan_out.branch_name ~* '${payload.search}'` : ''}
          GROUP BY scan_out.branch_name, scan_out.do_pod_code
        )
        SELECT *, "totalScanInAwb" AS "totalBagSortir"
        FROM (
          SELECT
            "branchTo",
            "doPodCode",
            CASE
              WHEN "awbHub" = "awbScanOutBagSortir" THEN 'Loading'
              ELSE 'Sortir'
            END AS "status",
            "createdTime" AS "createdTime",
            "awbHub" AS "totalAwb",
            "awbScanIn" AS "totalScanInAwb",
            "awbScanOutBagSortir" AS "totalScanOutBagSortir",
            "awbHub" - ("awbScanIn" + "awbScanOutBagSortir") AS "remainingAwbSortir"
          FROM detail
          GROUP BY "branchTo", "status", "createdTime", "awbHub", "awbScanIn", "awbScanOutBagSortir", "doPodCode"
        ) t1
        ${payload.sortBy && sortingMap[payload.sortBy] ?
        `ORDER BY ${sortingMap[payload.sortBy]} ${payload.sortDir}, "remainingAwbSortir" DESC` :
        `ORDER BY
          CASE
            WHEN "status" = 'Sortir' then 1
            WHEN "status" = 'Loading' then 2
          END, "remainingAwbSortir" DESC`
        }
        LIMIT ${payload.limit}
        ${payload.page ? `OFFSET ${payload.limit * (Number(payload.page) - 1)}` : ''};
      `;
      return query;
    }

    static async getQueryCSVMonitoringSortirByFilterOrion(payload: BaseMetaPayloadVm): Promise<string> {
      const map = {
        createdTime: 'doh.created_time',
        branchIdFrom: 'doh.branch_id',
        branchIdTo: 'scan_out.branch_id',
        branchTo: 'scan_out.branch_name',
      };
      const optr = ['gte', 'gt'];
      const whereQuery = await this.orionFilterToQueryRaw(payload.filters, map, true);
      // const whereSubQuery = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'bi1.created_time', optr, 'createdTime');
      // const whereSubQueryScanOut = await this.orionFilterToQueryRawBySelectedFilter(payload.filters, 'dp2.do_pod_date_time', optr, 'createdTime');

      let filterQuery = payload.search ? `origin ~* '${payload.search}'` : '';
      filterQuery += filterQuery && whereQuery ? 'AND' : '';
      filterQuery += whereQuery;

      const query = `
      SELECT
        "Lokasi Hub",
        "Nomor Resi",
        CASE
          WHEN s.code = 'IN' THEN "do_pod_code_fm"
          WHEN s.code = 'OUT' THEN "do_pod_code_scan_out"
        END AS "Surat Jalan",
        CASE
          WHEN s.code = 'IN' THEN "bag_number_in"
          WHEN s.code = 'SORT' THEN "bag_number_sort"
          WHEN s.code = 'OUT' THEN "bag_number_out"
        END AS "Nomor Gabungan",
        CASE
          WHEN s.code = 'IN' THEN "User"
          WHEN s.code = 'SORT' THEN "User Bag Sortir"
          WHEN s.code = 'OUT' THEN "User Scanout"
        END AS "User",
        s.code as "Status",
        CASE WHEN s.code = 'IN' THEN "Tanggal Transaksi IN"
          WHEN s.code = 'SORT' THEN "Tanggal Transaksi SORT"
          WHEN s.code = 'OUT' THEN "Tanggal Transaksi OUT"
        END as "Tanggal Transaksi"
      FROM
        (
          SELECT
            br.branch_name AS "Lokasi Hub",
            CONCAT('="',dohd.awb_number, '"') AS "Nomor Resi",
            scan_out.bag_number AS "bag_number_out",
            CONCAT(bag_sortir.bag_number, LPAD(bag_sortir.bag_seq::text, 3, '0')) as "bag_number_sort",
            doh.bag_number as "bag_number_in",
            CONCAT('IN', (CASE WHEN bag_sortir.awb_id IS NOT NULL THEN ',SORT' END), (CASE WHEN scan_out.awb_id IS NOT NULL THEN ',OUT' END)) "Status",
            CONCAT(u.first_name, ' ', u.last_name) AS "User",
            TO_CHAR(dohd.created_time, 'DD Mon YYYY HH24:MI') AS "Tanggal Transaksi IN",
            TO_CHAR(bag_sortir.created_time, 'DD Mon YYYY HH24:MI') AS "Tanggal Transaksi SORT",
            TO_CHAR(scan_out.created_time, 'DD Mon YYYY HH24:MI') AS "Tanggal Transaksi OUT",
            scan_out.do_pod_code AS do_pod_code_scan_out,
            fm.do_pod_code AS do_pod_code_fm,
            CONCAT(bag_sortir.first_name, ' ', bag_sortir.last_name) AS "User Bag Sortir",
            CONCAT(scan_out.first_name, ' ', scan_out.last_name) AS "User Scanout"
          FROM
            dropoff_hub doh
          INNER JOIN branch br ON br.branch_id = doh.branch_id AND br.is_deleted = FALSE
          INNER JOIN bag bag ON bag.bag_id = doh.bag_id AND bag.is_deleted = FALSE AND bag.branch_id IS NOT NULL AND (is_sortir IS NULL OR is_sortir = FALSE)
          INNER JOIN bag_item bi ON bi.bag_item_id = doh.bag_item_id AND bi.is_deleted = FALSE
          INNER JOIN bag_item_awb bia ON bia.bag_item_id = bi.bag_item_id AND bia.is_deleted = FALSE
          INNER JOIN dropoff_hub_detail dohd ON dohd.dropoff_hub_id = doh.dropoff_hub_id AND dohd.is_deleted = FALSE
          INNER JOIN users u ON u.user_id = dohd.user_id_created AND u.is_deleted = FALSE
          LEFT JOIN LATERAL (
            SELECT dp0.do_pod_code
            FROM do_pod_detail_bag dpdb0
            INNER JOIN do_pod dp0 ON dp0.do_pod_id = dpdb0.do_pod_id AND dpdb0.is_deleted = FALSE
            WHERE dp0.do_pod_type = ${POD_TYPE.OUT_BRANCH} AND
            bia.bag_item_id = dpdb0.bag_item_id AND
            dpdb0.is_deleted = FALSE
          ) AS fm ON true
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
            AND dp2.do_pod_type = ${POD_TYPE.OUT_HUB}
            AND dp2.user_id_driver IS NOT NULL AND dp2.branch_id_to IS NOT NULL
          ) AS scan_out ON true
          WHERE
            doh.branch_id IS NOT NULL
            ${whereQuery ? `AND ${whereQuery}` : ''}
            ${payload.search ? `AND scan_out.branch_name ~* '${payload.search}'` : ''}
          GROUP BY br.branch_name,
            dohd.awb_number,
            scan_out.bag_number,
            bag_sortir.bag_number,
            bag_sortir.bag_seq,
            scan_out.awb_id,
            bag_sortir.awb_id,
            doh.bag_number,
            u.first_name,
            u.last_name,
            dohd.created_time,
            bag_sortir.created_time,
            scan_out.created_time,
            bag.bag_number,
            bi.bag_seq,
            scan_out.do_pod_code,
            fm.do_pod_code,
            bag_sortir.first_name,
            bag_sortir.last_name,
            scan_out.first_name,
            scan_out.last_name
        ) t1, unnest(string_to_array("Status" , ','))  s(code);
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

    static async orionFilterToQueryRawBySelectedFilter(
      filters: BaseMetaPayloadFilterVm[],
      field: string,
      operator: string[],
      key: string,
    ): Promise<string> {
      let query = '';
      for (const filter of filters) {
        if (filter.value === '' || !operator.includes(filter.operator) || filter.field != key) {
          continue;
        }
        const opt = RequestQueryBuidlerService
          .convertFilterOperatorToSqlOperator(filter.operator as BaseMetaPayloadFilterVmOperator);
        let str = `${field} ${opt} '${filter.value}'`;
        if (opt == 'LIKE') {
          str = `${field} ${opt} '%${filter.value}%'`;
        }
        query += query ? `AND ${str}\n` : `${str}\n`;
      }
      return query;
    }

    static async customQueryRawFromMultipleFieldsByOrionFilters(
      filters: BaseMetaPayloadFilterVm[],
      map: any,
      key: string,
      optBoolean: string,
    ): Promise<string> {
      let query = '';
      for (const filter of filters) {
        const field = map[filter.field];
        if (!field || filter.value === '') {
          continue;
        }
        const opt = RequestQueryBuidlerService
          .convertFilterOperatorToSqlOperator(filter.operator as BaseMetaPayloadFilterVmOperator);
        let value = `${filter.value}`;
        if (opt == 'LIKE') {
          value = `'%${value}%'`;
        }

        let str = '';
        if (key != filter.field) {
          str = `${field} ${opt} '${value}'`;
        } else {
          for (const f of field) {
            str += str ? ` ${optBoolean} ${f} ${opt} '${value}'` : `(${f} ${opt} '${value}'`;
          }
          str += ')';
        }
        query += query ? `AND ${str}\n` : `${str}\n`;
      }
      return query;
    }
  }
