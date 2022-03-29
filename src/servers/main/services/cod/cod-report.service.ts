import {Injectable} from '@nestjs/common';
import {RedshiftReportingService} from '../report/redshift-reporting.service';
import {ConfigService} from '../../../../shared/services/config.service';
import { BaseMetaPayloadVm } from 'src/shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from 'src/shared/services/orion-repository.service';
import { AwbItemAttr } from 'src/shared/orm-entity/awb-item-attr';
import { AWB_STATUS } from 'src/shared/constants/awb-status.constant';
import { RoleGroupService } from 'src/shared/services/role-group.service';
import { AuthService } from 'src/shared/services/auth.service';
import {CodTransactionDetail} from '../../../../shared/orm-entity/cod-transaction-detail';
import {TRANSACTION_STATUS} from '../../../../shared/constants/transaction-status.constant';

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

  private generateQueryReportSupplierInvoiceAwb(supplierInvoiceId: string): string {
    const repo = new OrionRepositoryService(CodTransactionDetail, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.partner_name', 'partnerName'],
      ['t1.awb_date', 'awbDate'],
      ['t1.awb_number', 'awbNumber'],
      ['t1.parcel_value', 'parcelValue'],
      ['t1.cod_value', 'codValue'],
      ['t1.cod_fee', 'codFee'],
      ['t1.pod_date', 'podDate'],
      ['t1.consignee_name', 'consigneeName'],
      ['t1.cust_package', 'custPackage'],
      ['t1.pickup_source', 'pickupSource'],
      ['t1.current_position', 'currentPosition'],
      ['t1.destination_code', 'destinationCode'],
      ['t1.destination', 'destination'],
      ['t1.parcel_content', 'parcelContent'],
      ['t1.package_type', 'packageType'],
      ['t1.parcel_note', 'parcelNote'],
    );
    q.where(e => e.codSupplierInvoiceId, w => w.equals(supplierInvoiceId));
    q.andWhere(
      e => e.supplierInvoiceStatusId,
      w => w.equals(TRANSACTION_STATUS.DRAFT_INV),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    return q.getQuery();
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
      branch.branch_id, rep.representative_id
    `);

    q.orderByRaw('SUM(cp.cod_value)', 'DESC');

    return this.reportingService.generateReport(reportType, q.getQuery())
 }
}
