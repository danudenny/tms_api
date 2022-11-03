import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import moment = require('moment');
import { Branch } from '../../../../shared/orm-entity/branch';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfigService } from '../../../../shared/services/config.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { GenerateQueueFormDataPayloadVm, GenerateQueueOptionPayloadVm } from '../../../smd/models/smd-central-reporting.payload.vm';
import { CheckAwbReportGeneratePayloadVm, CheckAwbReportListPayloadVm } from '../../models/check-awb/check-awb-report-payload.bm';

const type = 'check_awb_reporting';
export class CheckAwbReportService {

  private get baseUrlInternal() {
    return ConfigService.get('reportingService.baseUrl');
  }

  public async checkAwbListReport(payload: CheckAwbReportListPayloadVm) {
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
      throw err.message;
    }
  }

  public async checkAwbGenerateReport(payload: CheckAwbReportGeneratePayloadVm): Promise<any> {
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
    const encodeQuery = await this.generateCheckAwb(payload);

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

  private  async generateCheckAwb(payload: CheckAwbReportGeneratePayloadVm): Promise<any> {

    let query = `SELECT \n
        acs.start_time AS "tgl_mulai_scan_resi", \n
        acs.end_time AS "tgl_selesai_scan_resi", \n
        acs.branch_id AS "analitic", \n
        b.branch_name AS "hub_scan_resi", \n
        concat(ue.nik+' - ', ue.fullname) as sorter,  \n
        "acs"."logs" AS "total_resi"
        FROM \n
          "public"."awb_check_summary" "acs" \n
          INNER JOIN "public"."users" "acs_user" ON "acs_user"."user_id" = "acs"."user_id_created" \n
          INNER JOIN "public"."employee" "ue" ON "ue"."employee_id" = "acs_user"."employee_id" \n
          AND ("ue"."is_deleted" = 'false') \n
          INNER JOIN "public"."branch" "b" ON "b"."branch_id" = "acs"."branch_id" \n
          AND ("b"."is_deleted" = 'false') \n
        WHERE \n
          (
            "acs"."start_time" >= '${moment(payload.startDate).format('YYYY-MM-DD')}'
            AND "acs"."start_time" < '${moment(payload.endDate).format('YYYY-MM-DD')}'
            AND "acs"."logs" != 0
          )`;
    if (payload.branchId && payload.branchId !== 0) {
            query = query + ` AND acs.branch_id = '${payload.branchId}' \n`;
          }
    query = query + `AND "acs"."is_deleted" = 'false'
      ORDER BY
        "acs"."created_time" DESC ;`;

    return Buffer.from(query).toString('base64');
  }

  async generateQueueRequest(params: GenerateQueueOptionPayloadVm, data: GenerateQueueFormDataPayloadVm): Promise<any> {
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
      return { status: request.status, ...request.data };
    } catch (err) {
      throw err.message;
    }

  }

}
