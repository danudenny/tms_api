import {Injectable} from '@nestjs/common';
import {RedshiftReportingService} from '../report/redshift-reporting.service';
import {ConfigService} from '../../../../shared/services/config.service';
import {BaseMetaPayloadVm, ReportBaseMetaPayloadVm} from '../../../../shared/models/base-meta-payload.vm';
import {OrionRepositoryService} from '../../../../shared/services/orion-repository.service';
import {AwbItemAttr} from '../../../../shared/orm-entity/awb-item-attr';
import {AWB_STATUS} from '../../../../shared/constants/awb-status.constant';
import {RoleGroupService} from '../../../../shared/services/role-group.service';
import {AuthService} from '../../../../shared/services/auth.service';
import {TRANSACTION_STATUS} from '../../../../shared/constants/transaction-status.constant';
import * as moment from 'moment';

@Injectable()
export class CodReportService {

  private configReportType;
  private configCodReport;

  constructor(
    private reportingService: RedshiftReportingService,
  ) {
    this.configReportType = ConfigService.get('codReportType');
    this.configCodReport = ConfigService.get('codReportConfig');
  }

  async fetchReportSupplierInvoiceAwb(supplierInvoiceId: string, page: number, limit: number) {
    const reportType = this.configReportType.supplierInvoiceAwb + ':' + supplierInvoiceId;
    return this.reportingService.fetchReport(page, limit, reportType);
  }

  async generateReportSupplierInvoiceAwb(supplierInvoiceId: string) {
    const reportType = this.configReportType.supplierInvoiceAwb + ':' + supplierInvoiceId;
    const rawQuery = this.generateQueryReportSupplierInvoiceAwb(supplierInvoiceId);
    return this.reportingService.generateReport(reportType, rawQuery);
  }

  async fetchReportCODFee(page: number, limit: number) {
    const reportType = this.configReportType.supplierInvoiceFee;
    return this.reportingService.fetchReport(page, limit, reportType);
  }

  async generateReportCODFee(payload: ReportBaseMetaPayloadVm) {
    const reportType = this.configReportType.supplierInvoiceFee;
    const rawQuery = this.generateQueryReportCODFee(payload.filters);

    return this.reportingService.generateReport(reportType, rawQuery);
  }

  private generateQueryReportCODFee(filters) {
    let queryParam = "";
    for (const filter of filters) {
      if (filter.field == 'periodStart' && filter.value) {
        const d = moment
          .utc(filter.value)
          .format('YYYY-MM-DD 00:00:00');

        queryParam += `AND ctd.updated_time >= '${d}' `;
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const d = moment
          .utc(filter.value)
          .format('YYYY-MM-DD 00:00:00')
        queryParam += `AND ctd.updated_time < '${d}' `;
      }

      if (filter.field == 'supplier' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.partner_id = ${filter.value} `;
      }

      if (filter.field == 'awbStatus' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.supplier_invoice_status_id = ${filter.value} `;
      }

      if (filter.field == 'branchLast' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.current_position_id = ${filter.value} `;
      }

      if (filter.field == 'transactionStatus' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.transaction_status_id = ${filter.value} `;
      }

      if (filter.field == 'sigesit' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.user_id_driver = ${filter.value} `;
      }
    }

    queryParam += "AND ctd.supplier_invoice_status_id = 45000 AND ctd.is_deleted = false";

    const query = `SELECT 
        ctd.partner_name AS "partner", 
        TO_CHAR(ctd.awb_date, 'YYYY-MM-DD') AS "awb date", 
        ctd.awb_number AS "awb", 
        round(ctd.parcel_value, `+ this.configCodReport.roundedDecimal + `) AS "package amount", 
        round(ctd.cod_value, `+ this.configCodReport.roundedDecimal + `) AS "cod amount", 
        round(ctd.cod_fee, `+ this.configCodReport.roundedDecimal + `) AS "cod fee", 
        round(ctd.cod_value, `+ this.configCodReport.roundedDecimal + `) AS "amount transfer", 
        TO_CHAR(ctd.pod_date, 'YYYY-MM-DD HH:mm') AS "pod datetime",
        ctd.consignee_name AS "recipient",
        ctd.payment_method AS "tipe pembayaran",
        'PAID' AS "Status Internal", 
        'DLV' AS "Tracking Status", 
        ctd.cust_package AS "cust package", 
        ctd.pickup_source AS "pickup source", 
        ctd.current_position AS "current position", 
        ctd.destination_code AS "destination code", 
        ctd.destination AS "destination", 
        rep.representative_code AS "perwakilan",
        coalesce(driver.nik, '') || ' - ' || coalesce(driver.fullname, '') AS "sigesit", 
        regexp_replace(ctd.parcel_content, '`+ this.configCodReport.regexExpToReplace + `', ' ') AS "package detail",
        ctd.package_type AS "services", 
        regexp_replace(ctd.parcel_note, '`+ this.configCodReport.regexExpToReplace + `', ' ') AS "note", 
        '' AS "submitted date", 
        '' AS "submitted number", 
        coalesce(to_char(ctd.updated_time, 'YYYY-MM-DD HH:mm'), '') AS "date updated", 
        coalesce(admin.nik, '') || ' - ' || coalesce(admin.fullname, '')  AS "user updated" 
      FROM 
        cod_transaction_detail AS ctd 
      INNER JOIN users AS du 
        ON ctd.user_id_driver = du.user_id 
      INNER JOIN employee AS driver 
        ON du.employee_id = driver.employee_id
      INNER JOIN users AS au 
        ON ctd.user_id_updated = au.user_id 
      INNER JOIN employee AS admin 
        ON au.employee_id = admin.employee_id 
      INNER JOIN branch AS br 
        ON ctd.branch_id = br.branch_id 
      INNER JOIN representative AS rep 
        ON br.representative_id = rep.representative_id 
      WHERE 
        TRUE 
      ${queryParam}
      `;

    return query;
  }

  private generateQueryReportSupplierInvoiceAwb(supplierInvoiceId: string): string {
    const query = `SELECT 
                    t1.partner_name AS "partner name", 
                    t1.awb_date AS "awb date", 
                    t1.awb_number AS "awb", 
                    round(t1.parcel_value, `+ this.configCodReport.roundedDecimal + `) AS "package amount", 
                    round(t1.cod_value, `+ this.configCodReport.roundedDecimal + `) AS "cod amount", 
                    round(t1.cod_fee, `+ this.configCodReport.roundedDecimal + `) AS "cod fee", 
                    round(t1.cod_value, `+ this.configCodReport.roundedDecimal + `) AS "amount transfer", 
                    t1.pod_date AS "pod datetime",
                    t1.consignee_name AS "recipient",
                    'DRAFT INVOICE' AS "Status internal",
                    'DLV' AS "Tracking Status",
                    t1.cust_package AS "cust package",
                    t1.pickup_source AS "pickup source",
                    t1.current_position AS "current position",
                    t1.destination_code AS "destination code",
                    t1.destination AS "destination",
                    regexp_replace(t1.parcel_content, '`+ this.configCodReport.regexExpToReplace + `', ' ') AS "package detail",
                    t1.package_type AS "services",
                    regexp_replace(t1.parcel_note, '`+ this.configCodReport.regexExpToReplace + `', ' ') AS "note"
                  FROM 
                    cod_transaction_detail AS t1 
                  WHERE 
                    t1.cod_supplier_invoice_id = '${supplierInvoiceId}' 
                  AND 
                    t1.supplier_invoice_status_id = ${TRANSACTION_STATUS.DRAFT_INV}  
                  AND 
                    t1.is_deleted = false 
                  `;
    return query;
  }

  async fetchReportAwbSummary(page: number, limit: number) {
    const reportType = this.configReportType.awbCodSummary;
    return this.reportingService.fetchReport(page, limit, reportType);
  }


  async generateAWBSummaryReport(payload: BaseMetaPayloadVm) {
    const reportType = this.configReportType.awbCodSummary;
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthMetadata();


    payload.fieldResolverMap['transactionDate'] = 'cp.updated_time';
    payload.fieldResolverMap['transactionStatusId'] =
      't1.transaction_status_id';
    payload.fieldResolverMap['branchIdFinal'] = 'cp.branch_id';
    payload.fieldResolverMap['codPaymentMethod'] = 'cp.cod_payment_method';
    payload.fieldResolverMap['representativeId'] = 'branch.representative_id';
    payload.fieldResolverMap['userIdDriver'] = 'cp.user_id_driver';

    const repo = new OrionRepositoryService(AwbItemAttr, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['rep.representative_code', 'perwakilan'],
      ['branch.branch_id', 'branchIdFinal'],
      ['branch.branch_name', 'branchNameFinal'],
      ['SUM(round(cp.cod_value, ' + this.configCodReport.roundedDecimal + '))', 'priceCod'],
      ['COUNT(t1.awb_item_id)', 'countAwb'],
    );

    q.innerJoin(e => e.codPayment, 'cp', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment.branchFinal, 'branch', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment.branchFinal.representative, 'rep', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region handle Role COD
    if (
      RoleGroupService.isRoleCodMerge(
        permissionPayload.roleId,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 'codmerger', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }

    if (
      RoleGroupService.isRoleCodAdmin(
        permissionPayload.roleId,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.andWhere(
        e => e.codPayment.branchId,
        w => w.equals(permissionPayload.branchId),
      );
    }
    //#endregion

    q.andWhere(e => e.awbStatusIdFinal, w => w.equals(AWB_STATUS.DLV));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    q.groupByRaw(`
      branch.branch_id, rep.representative_id, rep.representative_code, branch.branch_name
    `);

    q.orderByRaw('SUM(cp.cod_value)', 'DESC');

    return this.reportingService.generateReport(reportType, q.getQuery())
  }

  async generateAwbCodTransactionDetailReport(payload: ReportBaseMetaPayloadVm) {
    const reportType = this.configReportType.codNonFee;
    const rawQuery = this.generateQueryAwbCodTransaction(payload);

    return this.reportingService.generateReport(reportType, rawQuery);
  }

  async fetchReportAwbTransactionDetail(page: number, limit: number) {
    const reportType = this.configReportType.codNonFee;
    return this.reportingService.fetchReport(page, limit, reportType);
  }

  private generateQueryAwbCodTransaction(payload: ReportBaseMetaPayloadVm) {
    let queryParam = '';
    for (const filter of payload.filters) {
      if (filter.field == 'periodStart' && filter.value) {
        queryParam += `AND aia.awb_history_date_last >= '${filter.value}' `;
      }
      if (filter.field == 'periodEnd' && filter.value) {
        queryParam += `AND aia.awb_history_date_last < '${filter.value}' `;
      }

      if (filter.field == 'transactionStart' && filter.value) {
        queryParam += `AND ctd.updated_time >= '${filter.value}' `;
      }

      if (filter.field == 'transactionEnd' && filter.value) {
        queryParam += `AND ctd.updated_time < '${filter.value}' `;
      }

      if (filter.field == 'manifestedStart' && filter.value) {
        queryParam += `AND a.awb_date >= '${filter.value}' `;
      }

      if (filter.field == 'manifestedEnd' && filter.value) {
        queryParam += `AND a.awb_date < '${filter.value}' `;
      }

      if (filter.field == 'partnerId' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND pr.partner_id = ${filter.value} `;
      }

      if (filter.field == 'representativeId' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND rs.representative_id = ${filter.value} `;
      }

      if (filter.field == 'branchIdFinal' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND aia.branch_id_last = ${filter.value} `;
      }

      if (filter.field == 'awbStatusIdFinal' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND aia.awb_status_id_last = ${filter.value} `;
      }

      if (filter.field == 'transactionStatusId' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.transaction_status_id = ${filter.value} `;
      }

      if (filter.field == 'sigesit' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.user_id_driver = ${filter.value} `;
      }

      if (filter.field == 'supplierInvoiceStatusId' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.supplier_invoice_status_id = ${filter.value} `;
      }
    }

    return `
    SELECT DISTINCT
      p.partner_name AS "Partner",
      date(a.awb_date) AS "Awb Date",
      aia.awb_number AS "Awb",
      round(prd.parcel_value, ` + this.configCodReport.roundedDecimal + `) AS "Package Amount",
      round(prd.cod_value, ` + this.configCodReport.roundedDecimal + `) AS "COD Amount",
      round(ctd.cod_fee, ` + this.configCodReport.roundedDecimal + `) AS "COD Fee",
      round(prd.cod_value, ` + this.configCodReport.roundedDecimal + `) AS "Amount Transfer",
      aia.awb_history_date_last AS "POD Datetime",
      a.consignee_name AS "Recipient",
      ctd.payment_method AS "Tipe Pembayaran",
      ts.status_title AS "Status Internal",
      aws.awb_status_name AS "Tracking Status",
      tsinv.status_title AS "Status Invoice",
      pr.reference_no AS "Cust Package",
      bm.branch_name AS "Pickup Source",
      blh.branch_name AS "Current Position",
      a.ref_destination_code AS "Destination Code",
      ds.subdistrict AS "Destination",
      rs.representative_code AS "Perwakilan",
      CONCAT(es.nik+' - ', es.fullname) AS "Sigesit",
      regexp_replace(prd.parcel_content, '` + this.configCodReport.regexExpToReplace + `', ' ') AS "Package Detail",
      pt.package_type_name AS "Services",
      regexp_replace(prd.notes, '` + this.configCodReport.regexExpToReplace + `', ' ') AS "Notes",
      COALESCE(ctd.updated_time, alh.history_date) AS "Date Updated",
      COALESCE(CONCAT(ea.nik+' - ', ea.fullname), CONCAT(ealh.nik+' - ', ealh.fullname)) AS "User Updated"
    FROM public.awb_item_attr aia
      INNER JOIN public.awb a ON (a.awb_id = aia.awb_id and a.is_deleted = false and aia.is_deleted = false)
      LEFT JOIN public.cod_transaction_detail ctd ON (aia.awb_number = ctd.awb_number and ctd.is_deleted = false)
      LEFT JOIN public.transaction_status ts ON ts.transaction_status_id = ctd.transaction_status_id
      LEFT JOIN public.transaction_status tsinv ON tsinv.transaction_status_id = ctd.supplier_invoice_status_id
      LEFT JOIN public.pickup_request_detail prd ON (prd.awb_item_id = aia.awb_item_id and prd.is_deleted = false)
      LEFT JOIN public.pickup_request pr ON (pr.pickup_request_id = prd.pickup_request_id and pr.is_deleted = false)
      LEFT JOIN public.partner p ON (p.partner_id = pr.partner_id and p.is_deleted = false)
      LEFT JOIN public.package_type pt ON (pt.package_type_id = a.package_type_id)
      LEFT JOIN public.awb_history am ON am.awb_history_id = aia.awb_history_id_pickdrop
      LEFT JOIN public.awb_history alh ON alh.awb_history_id = aia.awb_history_id_last
      LEFT JOIN public.users adm ON adm.user_id = alh.user_id_updated
      LEFT JOIN public.employee ealh ON  ealh.employee_id = adm.employee_id
      LEFT JOIN public.awb_status aws ON aws.awb_status_id = aia.awb_status_id_last
      LEFT JOIN public.branch bm ON bm.branch_id = am.branch_id
      LEFT JOIN public.branch blh ON blh.branch_id = aia.branch_id_last
      LEFT JOIN public.destination ds ON a.ref_destination_code = ds.code
      LEFT JOIN public.users sigesit ON ctd.user_id_driver = sigesit.user_id
      LEFT JOIN public.employee es ON es.employee_id = sigesit.employee_id
      LEFT JOIN public.users admin ON ctd.user_id_updated = admin.user_id
      LEFT JOIN public.employee ea ON ea.employee_id = admin.employee_id
      LEFT JOIN public.representative rs ON rs.representative_code = a.ref_representative_code
    WHERE
      a.is_cod = true
      ${queryParam}
  `;
  }

  isNumber(value: string | number): boolean {
    return ((value != null) &&
      (value !== '') &&
      !isNaN(Number(value.toString())));
  }

}
