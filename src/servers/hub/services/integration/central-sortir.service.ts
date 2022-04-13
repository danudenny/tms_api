import { Injectable } from '@nestjs/common';
import { CentralSortirListPayloadVm, CentralSortirPayloadVm } from '../../models/central-sortir-payload.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import moment = require('moment');
import axios from 'axios';
import { response } from 'express';
import { ListBranchSortirLogVm } from '../../models/internal-sortir-list.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { Branch } from '../../../../shared/orm-entity/branch';

@Injectable()
export class CentralSortirService {

  private static get baseUrlInternal() {
    return 'http://api-internal.sicepat.io/operation/reporting-service';
  }

  static async getListMesinSortirReporting(query: CentralSortirListPayloadVm): Promise<any> {
    try {
      const offset = Number(query.page - 1) * Number(query.limit);
      const url = `${this.baseUrlInternal}/v1/reporting/report`;
      const authMeta = AuthService.getAuthData();
      const options = {
        params: {
          employee: authMeta.userId,
          report_type: 'mesin_sortir',
          limit: query.limit,
          offset,
        },
      };
      const res = await axios.get(url, options);
      const resData = res.data.data.report_queue;
      const total = res.data.data.total_count;

      const result = { data: [] };
      for (const valData  of resData) {
        const dataFilename = valData.file_name;
        const sortir_mesin = dataFilename.includes('sukses') ? 'SUKSES' : 'GAGAL';
        const splitFilename = dataFilename.split('|');
        let branch_name = '';
        if (splitFilename.length > 0) {
          if (splitFilename[1]) {
            branch_name = splitFilename[1].replace('_', ' ');
          }
        }
        const obj = {...valData, sortir_mesin, branch_name};
        result.data.push(obj);
      }
      result['paging'] = MetaService.set(query.page, query.limit, total);
      return result;
    } catch (e) {
      throw e.message;
    }
  }

  static async generateReportingMesinSortir(payload: CentralSortirPayloadVm): Promise<any> {
    try {
      const authMeta = AuthService.getAuthData();
      const encodeQuery = await this.generateMesinSortirQuery(payload);
      const report_type = 'mesin_sortir';
      let branchName = 'semua_cabang';
      const prefixIsSuccess = (payload.isSucceed === 1) ? 'sukses' : 'gagal';

      if (payload.branchId != null) {
        const getBranch = await Branch.findOne({
          where: {
            branchId: payload.branchId,
          },
        });
        if (getBranch) {
          branchName = getBranch.branchName;
          branchName = branchName.replace(/ /g, '_');
        }
      }

      // console.log('branchName', branchName);

      const filename = `reporting_mesin_sortir_${prefixIsSuccess}_${payload.startDate}_${payload.endDate}_${moment().format('YYYYMMDDHHmmss')}|${branchName}`;
      const url = `${this.baseUrlInternal}/v1/reporting/report`;
      const options = {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: {
          employee: authMeta.userId,
        },
      };

      const qs = require('querystring');
      const body = {
        query_encoded: encodeQuery,
        filename,
        report_type,
      };
      const request = await axios.post(url, qs.stringify(body), options);
      return { status: request.status, ...request.data };
    } catch (e) {
      throw e;
    }
  }

  static async generateMesinSortirQuery(payload: CentralSortirPayloadVm) {
    let query = `SELECT \n
    bsls.scan_date AS scan_date, \n
    bsls.updated_time AS updated_time, \n
    b.branch_id AS branch_id, \n
    b.branch_name AS branch_name, \n
    bsls.chute_number AS chute_number, \n
    bsls.awb_number AS awb_number, \n
    bsls.seal_number AS seal_number, \n
    bl.branch_id AS branch_id_lastmile, \n
    bl.branch_name AS branch_name_lastmile, \n
    bsls.is_cod AS is_cod, \n
    bsls.is_succeed AS is_succeed, \n
    bsls.reason AS reason \n
    FROM public.branch_sortir_log_summary bsls \n
    LEFT JOIN public.branch b ON b.branch_id = bsls.branch_id AND (b.is_deleted = 'false') \n
    LEFT JOIN public.branch bl ON bl.branch_id = bsls.branch_id_lastmile AND (bl.is_deleted = 'false') \n
    WHERE bsls.scan_date >= '${moment(payload.startDate).format('YYYY-MM-DD')}' \n
    AND bsls.scan_date < '${moment(payload.endDate).format('YYYY-MM-DD')}' \n
    AND bsls.is_deleted = 'false' \n
    AND bsls.is_succeed = '${payload.isSucceed}' `;
    if (payload.branchId !== null) {
      if (payload.branchId !== 0) {
        query = query + ` AND b.branch_id = '${payload.branchId}' `;
      }
    }
    // console.log('query', query);
    return Buffer.from(query).toString('base64');

  }
}
