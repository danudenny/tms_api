import { HttpException, HttpStatus } from '@nestjs/common';
import Axios from 'axios';
import moment = require('moment');
import { Branch } from '../../../../../shared/orm-entity/branch';
import { AuthService } from '../../../../../shared/services/auth.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { GenerateQueueFormDataPayloadVm, GenerateQueueOptionPayloadVm } from '../../../../smd/models/smd-central-reporting.payload.vm';
import { SortationReportGeneratePayloladVm, SortationReportListPayloadVm } from '../../../models/sortation/web/sortation-report-payload.vm';

const type = 'sortation_berangkat';
export class SortationReportService {
  private static get baseUrlInternal() {
    return 'http://api-internal.s.sicepat.io/operation/reporting-service';
  }

  public static async sortationListReport(payload: SortationReportListPayloadVm) {
    try {

      const offset = Number(payload.page - 1) * Number(payload.limit);
      const url = `${this.baseUrlInternal}/v1/reporting/report`;
      const authMeta = AuthService.getAuthData();
      const options = {
        params: {
          employee: authMeta.userId,
          report_type: type,
          limit: payload.limit,
          offset,
        },
      };
      const res = await Axios.get(url, options);
      const resData = res.data.data.report_queue;
      const total = res.data.data.total_count;

      const result = { data: [] };
      for (const valData  of resData) {
        const dataFilename = valData.file_name;
        const splitFilename = dataFilename.split('|');
        let branch_name = '';
        if (splitFilename.length > 0) {
          if (splitFilename[1]) {
            branch_name = splitFilename[1].replace('_', ' ');
          }
        }
        const obj = {...valData, type, branch_name};
        result.data.push(obj);
      }
      result['paging'] = MetaService.set(payload.page, payload.limit, total);
      return result;
    } catch (err) {
      const status = err.response.status || HttpStatus.BAD_REQUEST;
      const errResponse = {
        error: err.response.data && err.response.data.error,
        message: err.response.data && err.response.data.message,
        statusCode: status,
      };
      throw new HttpException(errResponse, status);
    }
  }

  public static async sortationGenerateReport(payload: SortationReportGeneratePayloladVm): Promise<any> {
    const authMeta = AuthService.getAuthData();

    let branchName;
    if (payload.branchId != null && payload.branchId != 0) {
      const dataBranch = await Branch.findOne({where: {branchId : payload.branchId,
      }});
      if (dataBranch) {
        branchName = dataBranch.branchName;
        branchName = branchName.replace(/ /g, '_');
      }
    }

    const filename = `${type}_${payload.startDate}-${payload.endDate}_${moment().format('YYYYMMDDHHmmss')}|${branchName}`;

    // encode query generate sortation
    const encodeQuery = await this.generateSortation(payload);

    // endpoint to redshift
    const params: GenerateQueueOptionPayloadVm = {
      userId: authMeta.userId};
    const formData: GenerateQueueFormDataPayloadVm = {
        encodeQuery,
        filename,
        reportType: type};
    const hitReport = this.generateQueueRequest(params, formData);
    return hitReport;

  }

  private static async generateSortation(payload: SortationReportGeneratePayloladVm): Promise<any> {
    let query = `SELECT \n
        ds.do_sortation_code AS "NoSuratJalan", \n
        ds.do_sortation_time AS "TglDibuat", \n
        ds.departure_date_time AS "tglBerangkat", \n
        ds.arrival_date_time AS "TglTiba", \n
        e.fullname AS "Handover", \n
        dsv.vehicle_number AS "Kendaraan", \n
        bf.branch_name AS "GeraiAsal", \n
        ds.branch_name_to_list AS "GeraiTujuan", \n
        dss.do_sortation_status_title AS "StatusTerakhir", \n
        ds.total_bag AS "totalBag", \n
        ds.total_bag_sortir AS "totalBagSortation" \n
      FROM \n
        "public"."do_sortation" "ds" \n
        INNER JOIN "public"."branch" "bf" ON "bf"."branch_id" = "ds"."branch_id_from"
        AND ("bf"."is_deleted" = 'false') \n
        INNER JOIN "public"."do_sortation_status" "dss" ON "dss"."do_sortation_status_id" = "ds"."do_sortation_status_id_last"
        AND ("dss"."is_deleted" = 'false') \n
        LEFT JOIN "public"."do_sortation_vehicle" "dsv" ON "dsv"."do_sortation_vehicle_id" = "ds"."do_sortation_vehicle_id_last"
        AND ("dsv"."is_deleted" = 'false') \n
        LEFT JOIN "public"."employee" "e" ON "e"."employee_id" = "dsv"."employee_driver_id"
        AND ("e"."is_deleted" = 'false') \n
      WHERE
        (
          "ds"."do_sortation_time" >= '${moment(payload.startDate).format('YYYY-MM-DD')}'
          AND "ds"."do_sortation_time" < '${moment(payload.endDate).format('YYYY-MM-DD')}'
        )`;
    if (payload.branchId && payload.branchId !== 0) {
            query = query + ` AND ds.branch_id_from = '${payload.branchId}' \n`;
          }
    query = query + `AND "ds"."is_deleted" = 'false'
      ORDER BY
        "ds"."created_time" DESC ;`;

    return Buffer.from(query).toString('base64');
  }

  static async generateQueueRequest(params: GenerateQueueOptionPayloadVm, data: GenerateQueueFormDataPayloadVm): Promise<any> {
    const url = `${this.baseUrlInternal}/v1/reporting/report`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        employee: params.userId,
      },
    };
    const qs = require('querystring');
    const body = {
      query_encoded: data.encodeQuery,
      filename: data.filename,
      report_type: data.reportType,
    };

    try {
      const request = await Axios.post(url, qs.stringify(body), options);
      
    } catch (err) {
      const status = err.response.status || HttpStatus.BAD_REQUEST;
      const errResponse = {
        error: err.response.data && err.response.data.error,
        message: err.response.data && err.response.data.message,
        statusCode: status,
      };
      throw new HttpException(errResponse, status);
    }

  }
}
