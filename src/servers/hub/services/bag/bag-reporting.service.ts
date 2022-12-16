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

  private async generateBag(payload: BagReportGeneratePayloadVm ): Promise<any> {

    let query = ` SELECT
      t1.bag_number AS "gabung_paket",
      TO_CHAR(t1.created_time, 'DD Mon YYYY HH24:MI') AS "tgl_gabung_paket",
      t5.branch_name AS "gerai_asal",
      t1.ref_representative_code AS "perwakilan_tujuan",
      COUNT (t6.*) as "total_resi",
        CONCAT(
            CAST("t2"."weight" AS NUMERIC(20, 2)),
            ' Kg'
        ) AS "weight"
    FROM
        "public"."bag" "t1"
        INNER JOIN "public"."bag_item" "t2" ON "t2"."bag_id" = "t1"."bag_id"
        AND ("t2"."is_deleted" = 'false')
        LEFT JOIN "public"."branch" "t5" ON "t5"."branch_id" = "t1"."branch_id"
        AND ("t5"."is_deleted" = 'false')
        inner join "public"."bag_item_awb" "t6" on "t6"."bag_item_id" = "t2"."bag_item_id"
        AND ("t6"."is_deleted" = 'false')
        WHERE \n
          (
            "t1"."created_time" >= '${moment(payload.startDate).format('YYYY-MM-DD')}'
            AND "t1"."created_time" < '${moment(payload.endDate).format('YYYY-MM-DD')}'
          )\n`;
    if (payload.branchId && payload.branchId !== 0) {
        query = query + `AND t1.branch_id = '${payload.branchId}'`;
      }
    query = query + `
        and "t1"."is_deleted" = false
        AND "t1"."is_sortir" = false
        and "t1"."is_manual" = true
        GROUP by
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
    const url = `${this.baseUrlInternal}/v3/report`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const body = {
      query_encoded: data.encodeQuery,
      filename : data.filename,
      report_type : data.reportType,
      employee_id : params.userId,
    };

    try {
      const request = await Axios.post(url, JSON.stringify(body), options);
      return { status: request.status, ...request.data };
    } catch (err) {
      throw err.message;
    }

  }

  public async checkBagListReport(payload: BagReportListPayloadVm) {
    try {

      const offset = Number(payload.page - 1) * Number(payload.limit);
      const url = `${this.baseUrlInternal}/v3/report`;
      const authMeta = AuthService.getAuthData();
      const options = {
        params: {
          employee_id: authMeta.userId,
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
