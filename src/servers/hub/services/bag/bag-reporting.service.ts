import Axios from 'axios';
import { ConfigService } from '../../../../shared/services/config.service';
import { GenerateQueueFormDataPayloadVm, GenerateQueueOptionPayloadVm } from '../../../smd/models/smd-central-reporting.payload.vm';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { Branch } from '../../../../shared/orm-entity/branch';
import { BagReportGeneratePayloadVm, BagReportListPayloadVm } from '../../models/bag/bag-report.payload';
import { MetaService } from '../../../../shared/services/meta.service';

const type = 'gabung_paket_reporting';

export class BagReportingService {

  private get baseUrlInternal() {
    return ConfigService.get('reportingService.baseUrl');
  }

  public async bagGenerateReport(payload: BagReportGeneratePayloadVm): Promise<any> {
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
    const encodeQuery = await this.generateBag(payload);
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

  private async generateBag(payload  ): Promise<any> {

    let query = `SELECT \n
            t1.bag_number AS "gabung_paket", \n
            t1.created_time AS "tgl_gabung_paket", \n
            t5.branch_name AS "gerai_asal", \n
            t1.ref_representative_code AS "perwakilan_tujuan", \n
            COUNT (t6.*) as "total_resi", \n
            CONCAT(
              CAST(
                "t2"."weight" AS NUMERIC(20, 2)
              ),
              ' Kg'
            ) AS "weight" \n
          FROM \n
            "public"."bag" "t1" \n
            INNER JOIN "public"."bag_item" "t2" ON "t2"."bag_id" = "t1"."bag_id" \n
            AND ("t2"."is_deleted" = 'false') \n
            INNER JOIN "public"."branch" "t3" ON "t3"."branch_id" = "t1"."branch_id_to" \n
            AND ("t3"."is_deleted" = 'false') \n
            LEFT JOIN "public"."branch" "t5" ON "t5"."branch_id" = "t1"."branch_id" \n
            AND ("t5"."is_deleted" = 'false') \n
            inner join "public"."bag_item_awb" "t6" on "t6"."bag_item_id" = "t2"."bag_item_id" \n
            and ("t6"."is_deleted" = 'false') \n
          WHERE \n
            (
              "t1"."created_time" >= '${moment(payload.startDate).format('YYYY-MM-DD')} \n
              AND "t1"."created_time" < '${moment(payload.endDate).format('YYYY-MM-DD')}'  \n
            )
          `;
    if (payload.branchId && payload.branchId !== 0) {
        query = query + ` AND acs.branch_id = '${payload.branchId}' \n`;
      }
    query = query + `
        and "t1"."is_deleted" = false
        AND "t1"."is_sortir" = false
        and "t1"."is_manual" = true
          group by
          t1.bag_number,
          t1.created_time,
          t1.ref_representative_code,
          t5.branch_name,
          t2.weight
        ORDER BY
          "t1"."created_time" desc;`;

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

  public async checkBagListReport(payload: BagReportListPayloadVm) {
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

}
