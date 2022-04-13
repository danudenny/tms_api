import {Injectable} from '@nestjs/common';
import {RedshiftReportingService} from '../report/redshift-reporting.service';
import {ConfigService} from '../../../../shared/services/config.service';
import { BaseMetaPayloadVm, ReportBaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { RoleGroupService } from '../../../../shared/services/role-group.service';
import { AuthService } from '../../../../shared/services/auth.service';
import {CodTransactionDetail} from '../../../../shared/orm-entity/cod-transaction-detail';
import {TRANSACTION_STATUS} from '../../../../shared/constants/transaction-status.constant';
import { query } from 'winston';
import * as moment from 'moment';

@Injectable()
export class CodReportService {

  private configReportType;

  constructor(
    private reportingService: RedshiftReportingService,
  ) {
    this.configReportType = ConfigService.get('codReportType');
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
        
        queryParam +=  `AND ctd.updated_time >= Date('${d}') `;
      }

      if (filter.field == 'periodEnd' && filter.value) {
        const d = moment
          .utc(filter.value).add(1, 'days')
          .format('YYYY-MM-DD 00:00:00')
        queryParam +=  `AND ctd.updated_time < Date('${d}') `; 
      }

      if (filter.field == 'supplier' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.partner_id = ${filter.value} `;
      }

      if (filter.field == 'awbStatus' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.supplier_invoice_status_id = ${filter.value} `;
      }

      if (filter.field == 'branchLast' && filter.value && this.isNumber(filter.value)) {
        queryParam += `AND ctd.branch_id = ${filter.value} `;
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
        ctd.parcel_value AS "package amount", 
        ctd.cod_value AS "cod amount", 
        ctd.cod_fee AS "cod fee", 
        ctd.cod_value AS "amount transfer", 
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
        ctd.parcel_content AS "package detail",
        ctd.package_type AS "services", 
        ctd.parcel_note AS "note", 
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
                    t1.parcel_value AS "package amount",
                    t1.cod_value AS "cod amount",
                    t1.cod_fee AS "cod fee",
                    t1.cod_value AS "amount transfer",
                    t1.pod_date AS "pod datetime",
                    t1.consignee_name AS "recipient",
                    'DRAFT INVOICE' AS "Status internal",
                    'DLV' AS "Tracking Status",
                    t1.cust_package AS "cust package",
                    t1.pickup_source AS "pickup source",
                    t1.current_position AS "current position",
                    t1.destination_code AS "destination code",
                    t1.destination AS "destination",
                    t1.parcel_content AS "package detail",
                    t1.package_type AS "services",
                    t1.parcel_note AS "note" 
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

 async generateAWBSummaryReport(payload:BaseMetaPayloadVm) {
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
      ['SUM(cp.cod_value)', 'priceCod'],
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
        permissionPayload.roleName,
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
        permissionPayload.roleName,
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

  isNumber(value: string | number): boolean {
   return ((value != null) &&
           (value !== '') &&
           !isNaN(Number(value.toString())));
  }

}
