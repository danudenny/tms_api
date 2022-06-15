import { BadRequestException, HttpStatus } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { REPORT_TYPE } from '../../../../shared/constants/report.constant';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbHighValueUpload } from '../../../../shared/orm-entity/awb-high-value-upload';
import { AwbReturn } from '../../../../shared/orm-entity/awb-return';
import { ConfigService } from '../../../../shared/services/config.service';
import axios from 'axios';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebAwbReturnCancelService } from '../../services/web/web-awb-return-cancel.service';
import moment = require('moment');

export class ReportPodService {
  static async fetchReportResult(
    page: string,
    limit: string,
    reportType: string,
  ) {
    const path = '/reporting/report';
    const authMeta = AuthService.getAuthData();
    const offset = (Number(page) - 1) * Number(limit);

    const options = {
      params: {
        employee: authMeta.userId,
        report_type: reportType,
        limit: limit,
        offset,
      },
    };

    try {
      const res = await axios.get(
        ConfigService.get('exportService.baseUrl') + path,
        options,
      );
      const resData = res.data.data.report_queue;
      const total = res.data.data.total_count;

      const result = { data: [] };
      for (const valData of resData) {
        const obj = { ...valData };
        result.data.push(obj);
      }

      result['paging'] = MetaService.set(Number(page), Number(limit), total);

      return result;
    } catch (error) {
      if (error.response) {
        throw new BadRequestException(error.response.data);
      }
      throw error;
    }
  }

  static async generateReport(payload: BaseMetaPayloadVm, reportType: string) {
    const path = '/reporting/report';
    const authMeta = AuthService.getAuthMetadata();

    const filename = `reporting_${reportType}-${moment().format('YYYYMMDDHHmmss')}`;

    let queryParam: string;

    //generate query
    switch (reportType) {
      case REPORT_TYPE.PODHIGHVALUE:
        queryParam = await this.generatePodHighValueQuery(payload);
        break;
      case REPORT_TYPE.PODRETURN:
        queryParam = await this.generatePodReturQuery(payload);
        break;
      case REPORT_TYPE.CANCELRETURN:
        queryParam = await WebAwbReturnCancelService.exportReturnCancelList(payload);
        break;
      default:
        RequestErrorService.throwObj(
          {
            message: 'Invalid Payload',
          },
          HttpStatus.BAD_REQUEST,
        );
    }
    console.log(queryParam);
    //send to report service
    const options = {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        employee: authMeta.userId,
      },
    };

    const qs = require('querystring');
    const body = {
      query_encoded: Buffer.from(queryParam).toString('base64'),
      filename,
      report_type: reportType,
    };

    try {
      const response = await axios.post(
        ConfigService.get('exportService.baseUrl') + path,
        qs.stringify(body),
        options,
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadRequestException(error.response.data);
      }
      throw error;
    }
  }

  static async generatePodHighValueQuery(payload: BaseMetaPayloadVm) {
    payload.fieldResolverMap['partnerId'] = 't3.partner_id';
    payload.fieldResolverMap['uploadedDate'] = 't1.uploaded_time';
    payload.fieldResolverMap['displayName'] = 't1.display_name';
    payload.fieldResolverMap['partnerName'] = 't4.partner_name';
    payload.fieldResolverMap['branchName'] = 't6.branch_name';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['branchId'] = 't6.branch_id';
    payload.fieldResolverMap['branchFromId'] = 't8.branch_id';
    payload.fieldResolverMap['branchFromName'] = 't8.branch_name';
    payload.fieldResolverMap['awbHistoryDateLast'] = 't5.awb_history_date_last';
    payload.fieldResolverMap['packageTypeId'] = 't10.package_type_id';
    payload.fieldResolverMap['packageTypeName'] = 't10.package_type_name';
    payload.fieldResolverMap['packageTypeCode'] = 't10.package_type_code';
    payload.fieldResolverMap['perwakilan'] = 'bos2.perwakilan';
    payload.fieldResolverMap['oversla'] = 't10.slamaxdatetimeinternal';
    payload.fieldResolverMap['slamaxDateTimeInternal'] = 'bos.slamaxdatetimeinternal';

    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];

    const repo = new OrionRepositoryService(AwbHighValueUpload, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ["TO_CHAR(t1.uploaded_time, 'YYYY-MM-DD')", 'Tanggal Upload'],
      ["TO_CHAR(t5.awb_history_date_last, 'YYYY-MM-DD')", 'Tanggal Status'],
      [`''''||t1.awb_number`, 'Nomor Resi'],
      ['t4.partner_name', 'Nama Partner'],
      ['t2.recipient_name', 'Nama Penerima'],
      [`''''||t2.recipient_phone`, 'Telp Penerima'],
      ['t2.parcel_content', 'Isi Parsel'],
      ['t7.awb_status_name', 'Status Awb'],
      ['t9.district_code', 'Kode Kecamatan'],
      ['t6.branch_name', 'Gerai Tujuan'],
      ['t8.branch_name', 'Gerai Asal'],
      [
        `CASE WHEN t10.package_type_code = 'KEPO' THEN 'Gold' ELSE 'Berharga' END`,
        'Tipe Layanan',
      ],
      ['t11.representative_code', 'Perwakilan Asal'],
      ['t12.pickup_merchant', 'Seller'],
      ['t13.district_name', 'Tujuan Kecematan'],
      ['bos2.perwakilan', 'Perwakilan Tujuan'],
      ['(case when bos.status=1 and DATEDIFF(day, bos.slamaxdatetimeinternal, bos.lastvalidtrackingdatetime) > 0 then 1 else 0 end)', 'Oversla'],
      ['to_char(bos.slamaxdatetimeinternal,\'DD/MM/YYYY\')', 'Oversla Maksimal'],
    );
    q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbItemAttr, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbItemAttr.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb, 't12', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.branch, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.branch.district, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.packageType, 't10', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbItemAttr.awb.branch.representative, 't11', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.districtTo, 't13', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoinRaw('bosicepat_spartantrackingnotesummary','bos','bos.receiptnumber = t1.awb_number');
    q.leftJoinRaw('bosicepat_stt','bos2','bos2.nostt = t1.awb_number');

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.userIdUploaded, w => w.equals(1));

    return q.getQuery();
  }

  static async generatePodReturQuery(payload: BaseMetaPayloadVm) {
    payload.fieldResolverMap['awbReturnId'] = 't1.awb_return_id';
    payload.fieldResolverMap['originAwbId'] = 't1.origin_awb_id';
    payload.fieldResolverMap['originAwbNumber'] = 't1.origin_awb_number';
    payload.fieldResolverMap['returnAwbId'] = 't1.return_awb_id';
    payload.fieldResolverMap['partnerLogisticAwb'] = 't1.partner_logistic_awb';
    payload.fieldResolverMap['returnAwbNumber'] = 't1.return_awb_number';
    payload.fieldResolverMap['isPartnerLogistic'] = 't1.is_partner_logistic';
    payload.fieldResolverMap['partnerLogisticName'] =
      't1.partner_logistic_name';
    payload.fieldResolverMap['branchIdTo'] = 't1.branch_id';
    payload.fieldResolverMap['branchTo'] = 't3.branch_name';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['updatedTime'] = 't1.updated_time';
    payload.fieldResolverMap['awbReplacementTime'] = 't1.awb_replacement_time';
    payload.fieldResolverMap['awbStatus'] = 't2.awb_status_name';
    payload.fieldResolverMap['awbStatusId'] = 't2.awb_status_id';
    payload.fieldResolverMap['partnerLogisticId'] = 't1.partner_logistic_id';
    payload.fieldResolverMap['branchManifest'] = 't4.branch_name';
    payload.fieldResolverMap['branchIdManifest'] = 't4.branch_id';
    payload.fieldResolverMap['branchIdFrom'] = 't6.branch_id';
    payload.fieldResolverMap['branchFrom'] = 't6.branch_name';
    payload.fieldResolverMap['consignerName'] =
      't7.ref_prev_customer_account_id';
    payload.fieldResolverMap['userUpdatedName'] = '"userUpdatedName"';
    payload.fieldResolverMap['replacementAwbStatusLast'] =
      '"replacementAwbStatusLast"';

    payload.globalSearchFields = [
      {
        field: 'originAwbNumber',
      },
    ];

    const repo = new OrionRepositoryService(AwbReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      [`''''||t1.origin_awb_number`, 'Resi'],
      ['t2.awb_status_name', 'Status'],
      ['t9.awb_status_name', 'Status Resi Pengganti'],
      ["TO_CHAR(t1.created_time, 'YYYY-MM-DD')", 'Tanggal Retur'],
      ["TO_CHAR(t1.updated_time, 'YYYY-MM-DD')", 'Tanggal Update Retur'],
      [
        "TO_CHAR(t1.awb_replacement_time, 'YYYY-MM-DD')",
        'Tanggal Status Resi Pengganti',
      ],
      ['t4.branch_name', 'Gerai Manifest'],
      ['t6.branch_name', 'Gerai Asal Retur'],
      ['t3.branch_name', 'Gerai Terakhir Retur'],
      [`CAST(t7.total_cod_value AS NUMERIC(20,2))`, 'Nilai COD'],
      [`COALESCE(''''||t1.return_awb_number, '-')`, 'Resi Retur'],
      [
        `CASE
          WHEN t1.user_id_driver IS NOT NULL THEN 'Manual'
          WHEN t1.partner_logistic_name IS NOT NULL THEN t1.partner_logistic_name
          ELSE 'Internal'
        END`,
        'Jenis Retur',
      ],
      [
        `COALESCE(t7.ref_prev_customer_account_id, t7.ref_customer_account_id,'')`,
        'Pengirim',
      ],
      [`t8.nik||' - '||t8.fullname`, 'User Update'],
    );

    q.innerJoin(e => e.originAwb.awbStatus, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.awb.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branchFrom, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.userUpdated.employee, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.returnAwb.awbStatus, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    return q.getQuery();
  }
}
