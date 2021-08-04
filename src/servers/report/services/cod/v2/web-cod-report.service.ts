import * as moment from 'moment';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CodAwbRevision } from '../../../../../shared/orm-entity/cod-awb-revision';
import { RoleGroupService } from '../../../../../shared/services/role-group.service';

export class V2WebCodReportService {
  static async printCodSupplierInvoice(payload: BaseMetaPayloadVm, response) {
    try {
      const fileName = `COD_fee_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodHeader.join(',')}\n`);

      // mapping field
      payload.fieldResolverMap['statusDate'] = 'ctd.updated_time';
      payload.fieldResolverMap['supplier'] = 't6.partner_id';

      const repo = new OrionRepositoryService(AwbItemAttr, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        ['t6.partner_name', 'partnerName'],
        ['t1.awb_number', 'awbNumber'],
        ['t2.awb_date', 'awbDate'],
        ['t2.consignee_name', 'consigneeName'],
        ['t3.parcel_value', 'parcelValue'],
        ['t3.cod_value', 'codValue'],
        ['cp.updated_time', 'podDate'],
        ['cp.cod_payment_method', 'paymentMethod'],
        ['t14.status_title', 'transactionStatus'],
        ['t12.awb_status_title', 'trackingStatus'],
        ['t13.awb_status_title', 'trackingStatusFinal'],
        ['t4.reference_no', 'custPackage'],
        ['t8.branch_name', 'pickupSource'],
        ['t7.branch_name', 'currentPosition'],
        ['fin.branch_name', 'finalPosition'],
        ['t2.ref_destination_code', 'destinationCode'],
        ['t9.district_name', 'destination'],
        ['rep.representative_code', 'perwakilan'],
        ['t3.parcel_content', 'parcelContent'],
        ['t5.package_type_code', 'packageTypeCode'],
        ['t1.awb_history_date_last', 'awbStatusDate'],
        ['ctd.updated_time', 'updatedTime'],
        [`CONCAT(edriveruser.nik, ' - ', edriveruser.fullname)`, 'driver'],
        [`CONCAT(eupduser.nik, ' - ', eupduser.fullname)`, 'updUser'],
        ['t3.notes', 'parcelNote'],
      );

      q.innerJoin(e => e.awb, 't2', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.isCod, w => w.isTrue()),
      );

      q.innerJoin(e => e.pickupRequestDetail, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't4');
      q.innerJoin(e => e.awb.packageType, 't5');
      q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't6');

      // get gerai terakhir resi di statuskan
      q.innerJoin(e => e.branchLast, 't7');

      // Data Jika sudah ada transaksi & Transaction Status
      q.innerJoin(e => e.codTransactionDetail, 'ctd', j =>
        j
          .andWhere(e => e.codTransactionId, w => w.isNotNull())
          .andWhere(
            e => e.supplierInvoiceStatusId,
            w => w.equals(TRANSACTION_STATUS.PAIDHO),
          ),
      );
      q.innerJoin(e => e.codTransactionDetail.transactionStatus, 't14');

      // Data Jika sudah dilakukan DLV - COD
      q.innerJoin(e => e.codPayment, 'cp');
      q.innerJoin(e => e.codPayment.branchFinal, 'fin');

      // get perwakilan di gerai terkhir
      q.leftJoin(e => e.branchLast.representative, 'rep');

      // gerai pickup / gerai di manifest resi
      q.leftJoin(e => e.awb.branchLast, 't8');
      q.leftJoin(e => e.awb.districtTo, 't9');

      // User Update Transaction
      q.innerJoin(e => e.codTransactionDetail.userAdmin, 'upduser');
      q.innerJoin(e => e.codTransactionDetail.userAdmin.employee, 'eupduser');

      // User Driver Sigesit
      q.innerJoin(e => e.codPayment.userDriver, 'driveruser');
      q.innerJoin(e => e.codPayment.userDriver.employee, 'edriveruser');

      // LAST STATUS
      q.leftJoin(e => e.awbStatus, 't12');

      // FINAL STATUS
      q.leftJoin(e => e.awbStatusFinal, 't13');

      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformCodFee);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async printNonCodTransactionSupplierInvoice(
    payload: BaseMetaPayloadVm,
    response,
  ) {
    try {
      const fileName = `COD_nonfee_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodNONFeeTransactionHeader.join(',')}\n`);

      // mapping field
      payload.fieldResolverMap['statusDate'] = 't1.awb_history_date_last';
      payload.fieldResolverMap['transactionDate'] = 'ctd.updated_time';
      payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
      payload.fieldResolverMap['supplier'] = 't6.partner_id';
      payload.fieldResolverMap['awbStatusId'] = 't1.awb_status_id_last';
      payload.fieldResolverMap['branchLastId'] = 't7.branch_id';
      payload.fieldResolverMap['transactionStatus'] =
        't1.transaction_status_id';
      payload.fieldResolverMap['supplierInvoiceStatus'] =
        'ctd.supplier_invoice_status_id';

      const repo = new OrionRepositoryService(AwbItemAttr, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        ['t6.partner_name', 'partnerName'],
        ['t1.awb_number', 'awbNumber'],
        ['t2.awb_date', 'awbDate'],
        ['t2.consignee_name', 'consigneeName'],
        ['t3.parcel_value', 'parcelValue'],
        ['t3.cod_value', 'codValue'],
        ['cp.updated_time', 'podDate'],
        ['cp.cod_payment_method', 'paymentMethod'],
        ['t14.status_title', 'transactionStatus'],
        ['t11.status_title', 'supplierInvoiceStatus'],
        ['t12.awb_status_title', 'trackingStatus'],
        ['t4.reference_no', 'custPackage'],
        ['t8.branch_name', 'pickupSource'],
        ['t7.branch_name', 'currentPosition'],
        ['t2.ref_destination_code', 'destinationCode'],
        ['t9.district_name', 'destination'],
        ['t3.parcel_content', 'parcelContent'],
        ['t5.package_type_code', 'packageTypeCode'],
        ['t1.awb_history_date_last', 'awbStatusDate'],
        ['ctd.updated_time', 'updatedTime'],
        [`CONCAT(eupduser.nik, ' - ', eupduser.fullname)`, 'updUser'],
        ['t3.notes', 'parcelNote'],
      );

      q.innerJoin(e => e.awb, 't2', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.isCod, w => w.isTrue()),
      );

      q.innerJoin(e => e.pickupRequestDetail, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't4');
      q.innerJoin(e => e.awb.packageType, 't5');
      q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't6');

      // get gerai terakhir resi di statuskan
      q.innerJoin(e => e.branchLast, 't7');

      // Data Jika sudah ada transaksi & Transaction Status
      q.leftJoin(e => e.codTransactionDetail, 'ctd', j =>
        j.andWhere(e => e.codTransactionId, w => w.isNotNull()),
      );
      q.leftJoin(e => e.codTransactionDetail.transactionStatus, 't14');

      // Data Jika sudah dilakukan DLV - COD
      q.leftJoin(e => e.codPayment, 'cp');

      // gerai pickup / gerai di manifest resi
      q.leftJoin(e => e.awb.branchLast, 't8');
      q.leftJoin(e => e.awb.districtTo, 't9');

      // User Update Transaction
      q.leftJoin(e => e.codTransactionDetail.userAdmin, 'upduser');
      q.leftJoin(e => e.codTransactionDetail.userAdmin.employee, 'eupduser');

      // Invoice Status
      q.leftJoin(e => e.codTransactionDetail.supplierInvoiceStatus, 't11');

      // LAST STATUS
      q.leftJoin(e => e.awbStatus, 't12');

      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformTransaction);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async printNonCodSupplierInvoice(
    payload: BaseMetaPayloadVm,
    response,
  ) {
    try {
      const fileName = `COD_nonfee_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodNONFeeHeader.join(',')}\n`);

      // mapping field
      payload.fieldResolverMap['statusDate'] = 't1.awb_history_date_last';
      payload.fieldResolverMap['transactionDate'] = 'ctd.updated_time';
      payload.fieldResolverMap['awbStatusId'] = 't1.awb_status_id_last';
      payload.fieldResolverMap['branchLastId'] = 't7.branch_id';
      payload.fieldResolverMap['transactionStatus'] =
        't1.transaction_status_id';
      payload.fieldResolverMap['sigesit'] = 'cp.user_id_driver';

      const repo = new OrionRepositoryService(AwbItemAttr, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        ['t6.partner_name', 'partnerName'],
        ['t1.awb_number', 'awbNumber'],
        ['t2.awb_date', 'awbDate'],
        ['t2.consignee_name', 'consigneeName'],
        ['t3.parcel_value', 'parcelValue'],
        ['t3.cod_value', 'codValue'],
        ['cp.updated_time', 'podDate'],
        ['cp.cod_payment_method', 'paymentMethod'],
        ['t14.status_title', 'transactionStatus'],
        ['t11.status_title', 'supplierInvoiceStatus'],
        ['t12.awb_status_title', 'trackingStatus'],
        ['t4.reference_no', 'custPackage'],
        ['t8.branch_name', 'pickupSource'],
        ['t7.branch_name', 'currentPosition'],
        ['t2.ref_destination_code', 'destinationCode'],
        ['t9.district_name', 'destination'],
        ['rep.representative_code', 'perwakilan'],
        ['t3.parcel_content', 'parcelContent'],
        ['t5.package_type_code', 'packageTypeCode'],
        ['t1.awb_history_date_last', 'awbStatusDate'],
        ['ctd.updated_time', 'updatedTime'],
        [`CONCAT(edriveruser.nik, ' - ', edriveruser.fullname)`, 'driver'],
        [`CONCAT(eupduser.nik, ' - ', eupduser.fullname)`, 'updUser'],
        ['t3.notes', 'parcelNote'],
      );

      q.innerJoin(e => e.awb, 't2', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.isCod, w => w.isTrue()),
      );

      q.innerJoin(e => e.pickupRequestDetail, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't4');
      q.innerJoin(e => e.awb.packageType, 't5');
      q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't6');

      // get gerai terakhir resi di statuskan
      q.innerJoin(e => e.branchLast, 't7');

      // Data Jika sudah ada transaksi & Transaction Status
      q.leftJoin(e => e.codTransactionDetail, 'ctd', j =>
        j.andWhere(e => e.codTransactionId, w => w.isNotNull()),
      );
      q.leftJoin(e => e.codTransactionDetail.transactionStatus, 't14');

      // Data Jika sudah dilakukan DLV - COD
      q.leftJoin(e => e.codPayment, 'cp');

      // get perwakilan di gerai terkhir
      q.leftJoin(e => e.branchLast.representative, 'rep');

      // gerai pickup / gerai di manifest resi
      q.leftJoin(e => e.awb.branchLast, 't8');
      q.leftJoin(e => e.awb.districtTo, 't9');

      // User Update Transaction
      q.leftJoin(e => e.codTransactionDetail.userAdmin, 'upduser');
      q.leftJoin(e => e.codTransactionDetail.userAdmin.employee, 'eupduser');

      // User Driver Sigesit
      q.leftJoin(e => e.codPayment.userDriver, 'driveruser');
      q.leftJoin(e => e.codPayment.userDriver.employee, 'edriveruser');

      // Invoice Status
      q.leftJoin(e => e.codTransactionDetail.supplierInvoiceStatus, 't11');

      // LAST STATUS
      q.leftJoin(e => e.awbStatus, 't12');

      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransform);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async exportAwb(payload: BaseMetaPayloadVm, response) {
    try {
      const authMeta = AuthService.getAuthData();
      const permissionPayload = AuthService.getPermissionTokenPayload();
      const fileName = `COD_resi_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodAwbHeader.join(',')}\n`);

      // mapping field
      payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
      payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
      payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
      payload.fieldResolverMap['transactionDate'] = 't1.awb_history_date_last';
      payload.fieldResolverMap['branchIdLast'] = 't1.branch_id_last';
      payload.fieldResolverMap['branchIdFinal'] = 't8.branch_id';
      payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
      payload.fieldResolverMap['awbStatusIdFinal'] = 't1.awb_status_id_final';
      payload.fieldResolverMap['codPaymentMethod'] = 't8.cod_payment_method';

      payload.fieldResolverMap['awbStatusLast'] = 't7.awb_status_title';
      payload.fieldResolverMap['awbStatusFinal'] = 't11.awb_status_title';
      payload.fieldResolverMap['branchNameLast'] = 't6.branch_name';
      payload.fieldResolverMap['branchNameFinal'] = 't12.branch_name';
      payload.fieldResolverMap['userIdDriver'] = 't4.user_id';
      payload.fieldResolverMap['driverName'] = 't4.first_name';
      payload.fieldResolverMap['packageTypeCode'] = 't5.package_type_code';
      payload.fieldResolverMap['transactionStatusId'] =
        't1.transaction_status_id';
      payload.fieldResolverMap['transactionStatusName'] = 't9.status_title';
      payload.fieldResolverMap['representativeId'] = 't12.representative_id';

      if (payload.sortBy === '') {
        payload.sortBy = 'transactionDate';
      }

      const repo = new OrionRepositoryService(AwbItemAttr, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        ['t1.awb_number', 'awbNumber'],
        ['t1.awb_item_id', 'awbItemId'],
        ['t1.awb_history_date_last', 'transactionDate'],
        ['t1.awb_status_id_last', 'awbStatusIdLast'],
        ['t7.awb_status_title', 'awbStatusLast'],
        ['t1.awb_status_id_final', 'awbStatusIdFinal'],
        ['t11.awb_status_title', 'awbStatusFinal'],
        ['t1.branch_id_last', 'branchIdLast'],
        ['t6.branch_name', 'branchNameLast'],
        ['t8.branch_id', 'branchIdFinal'],
        ['t12.branch_name', 'branchNameFinal'],
        ['t2.awb_date', 'manifestedDate'],
        ['t2.consignee_name', 'consigneeName'],
        ['t2.total_cod_value', 'codValue'],
        ['t6.representative_id', 'representativeId'],
        ['t4.user_id', 'userIdDriver'],
        [`CONCAT(driver.nik, ' - ', t4.first_name)`, 'driverName'],
        ['t5.package_type_code', 'packageTypeCode'],
        ['t8.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
        [`t8.cod_payment_method`, 'codPaymentMethod'],
        ['t8.cod_payment_service', 'codPaymentService'],
        ['t8.no_reference', 'noReference'],
        ['t1.transaction_status_id', 'transactionStatusId'],
        ['t9.status_title', 'transactionStatusName'],
        ['coalesce(t8.branch_id, t1.branch_id_last)', 'branchIdCopy'],
        ['coalesce(t12.branch_name, t6.branch_name)', 'branchNameCopy'],
      );

      q.innerJoin(e => e.awb, 't2', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.isCod, w => w.isTrue()),
      );

      q.innerJoin(e => e.pickupRequestDetail, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.awb.packageType, 't5');

      q.innerJoin(e => e.branchLast, 't6', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.awbStatus, 't7', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.codPayment, 't8', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.awbStatusFinal, 't11', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.transactionStatus, 't9', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.codPayment.userDriver, 't4', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.codPayment.userDriver.employee, 'driver', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.codPayment.branchFinal, 't12', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      //#region Cod Merger
      if (
        RoleGroupService.roleCodMerge(
          permissionPayload.roleName,
          permissionPayload.isHeadOffice,
        )
      ) {
        q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
          j
            .andWhere(e => e.isDeleted, w => w.isFalse())
            .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
        );
      }
      //#endregion

      if (
        RoleGroupService.roleCodAdmin(
          permissionPayload.roleName,
          permissionPayload.isHeadOffice,
        )
      ) {
        q.andWhere(
          e => e.codPayment.branchId,
          w => w.equals(permissionPayload.branchId),
        );
      }

      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformAwb);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async exportSupplierInvoice(id: string, response) {
    try {
      const uuidv1 = require('uuid/v1');
      const fileName =
        moment().format('YYYYMMDD') + '_COD_' + uuidv1() + '.csv';
      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.SupplierInvoiceHeader.join(',')}\n`);

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
      q.where(e => e.codSupplierInvoiceId, w => w.equals(id));
      q.andWhere(
        e => e.supplierInvoiceStatusId,
        w => w.equals(TRANSACTION_STATUS.DRAFT_INV),
      );
      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformSupplierInvoice);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async printCodFinance(payload: BaseMetaPayloadVm, response) {
    try {
      const fileName = `COD_finance_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodHeaderFinance.join(',')}\n`);

      // mapping field
      payload.fieldResolverMap['transferDate'] = 'cbs.transfer_datetime';
      payload.fieldResolverMap['transactionStatus'] =
        'ctd.transaction_status_id';
      payload.fieldResolverMap['branchLast'] = 'ctd.current_position_id';

      const repo = new OrionRepositoryService(AwbItemAttr, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        ['t3.notes', 'parcelNote'],
        ['t6.partner_name', 'partnerName'],
        ['t1.awb_number', 'awbNumber'],
        ['awbsts.awb_status_name', 'awbStatusName'],
        ['t2.awb_date', 'awbDate'],
        ['t2.consignee_name', 'consigneeName'],
        ['t3.parcel_value', 'parcelValue'],
        ['t3.cod_value', 'codValue'],
        ['cp.updated_time', 'podDate'],
        ['cp.cod_payment_method', 'paymentMethod'],
        ['t14.status_title', 'transactionStatus'],
        // ['t11.status_title', 'supplierInvoiceStatus'],
        // ['t12.awb_status_title', 'trackingStatus'],
        ['t4.reference_no', 'custPackage'],
        // ['t8.branch_name', 'pickupSource'],
        // ['t7.branch_name', 'currentPosition'],
        ['ctd.current_position', 'currentPosition'],
        ['t2.ref_destination_code', 'destinationCode'],
        // ['t9.district_name', 'destination'],
        ['t3.parcel_content', 'parcelContent'],
        ['t5.package_type_code', 'packageTypeCode'],
        ['t1.awb_history_date_last', 'awbStatusDate'],
        ['cbs.transfer_datetime', 'transferDate'],
        ['ctd.updated_time', 'updatedTime'],
      );

      q.innerJoin(e => e.codTransactionDetail, 'ctd', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.awb, 't2', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.isCod, w => w.isTrue()),
      );

      q.innerJoin(e => e.pickupRequestDetail, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      // Data Jika sudah ada transaksi & Transaction Status
      q.innerJoin(e => e.codTransactionDetail.codTransaction, 'ct');
      q.innerJoin(
        e => e.codTransactionDetail.codTransaction.bankStatement,
        'cbs',
      );
      // Data Jika sudah dilakukan DLV - COD
      q.innerJoin(e => e.codPayment, 'cp');
      q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't4');
      q.innerJoin(e => e.awb.packageType, 't5');
      q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't6');
      // get gerai terakhir resi di statuskan
      q.innerJoin(e => e.branchLast, 't7');
      q.innerJoin(e => e.codTransactionDetail.transactionStatus, 't14');
      // User Update Transaction
      // q.innerJoin(e => e.codTransactionDetail.userAdmin, 'upduser');
      // q.innerJoin(e => e.codTransactionDetail.userAdmin.employee, 'eupduser');

      // q.innerJoin(e => e.codTransactionDetail.supplierInvoiceStatus, 't11');
      // LAST STATUS
      q.innerJoin(e => e.awbStatus, 'awbsts');

      // gerai pickup / gerai di manifest resi
      // q.leftJoin(e => e.awb.branchLast, 't8');
      // q.leftJoin(e => e.awb.districtTo, 't9');

      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformCodFinance);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async nominalStream(payload: BaseMetaPayloadVm, response) {
    try {
      const fileName = `COD_update_nominal_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodHeaderNominal.join(',')}\n`);

      // mapping field
      payload.fieldResolverMap['requestorId'] = 'car.request_user_id';
      payload.fieldResolverMap['updateDate'] = 'car.created_time';

      const repo = new OrionRepositoryService(CodAwbRevision, 'car');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q, true);

      q.selectRaw(
        ['car.awb_number', 'awbNumber'],
        ['car.created_time', 'updateDate'],
        ['car.request_user_id', 'requestorId'],
        ['userreq.first_name', 'requestorName'],
        ['car.cod_value', 'codValue'],
        ['car.cod_value_current', 'codValueCurrent'],
        ['at.url', 'attachmentUrl'],
      );

      q.innerJoin(e => e.attachment, 'at', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.requestor, 'userreq', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformCodNominal);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // ==================================== private ===================================
  private static CodHeader = [
    'Partner',
    'Awb Date',
    'Awb',
    'Package Amount',
    'Cod Amount',
    'Cod Fee',
    'Amount Transfer',
    'Pod Datetime',
    'Recipient',
    'Tipe Pembayaran',
    'Status Internal',
    'Tracking Status',
    'Cust Package',
    'Pickup Source',
    'Current Position',
    'Destination Code',
    'Destination',
    'Perwakilan',
    'Sigesit',
    'Package Detail',
    'Services',
    'Note',
    'Submitted Date',
    'Submitted Number',
    'Date Updated',
    'User Updated',
  ];

  private static CodNONFeeTransactionHeader = [
    'Partner',
    'Awb Date',
    'Awb',
    'Package Amount',
    'Cod Amount',
    'Cod Fee',
    'Amount Transfer',
    'Pod Datetime',
    'Recipient',
    'Tipe Pembayaran',
    'Status Internal',
    'Status Invoice',
    'Tracking Status',
    'Cust Package',
    'Pickup Source',
    'Current Position',
    'Destination Code',
    'Destination',
    'Package Detail',
    'Services',
    'Note',
    'Submitted Date',
    'Submitted Number',
    'Date Updated',
    'User Updated',
  ];

  private static CodNONFeeHeader = [
    'Partner',
    'Awb Date',
    'Awb',
    'Package Amount',
    'Cod Amount',
    'Amount Transfer',
    'Pod Datetime',
    'Recipient',
    'Tipe Pembayaran',
    'Status Internal',
    'Status Invoice',
    'Tracking Status',
    'Cust Package',
    'Pickup Source',
    'Current Position',
    'Destination Code',
    'Destination',
    'Perwakilan',
    'Sigesit',
    'Package Detail',
    'Services',
    'Note',
    'Submitted Date',
    'Submitted Number',
    'Date Updated',
    'User Updated',
  ];

  private static CodAwbHeader = [
    'No Resi',
    'Tgl Manifested',
    'Tgl Status',
    'Penerima',
    'Layanan',
    'Tipe Pembayaran',
    'Gerai Terakhir',
    'Gerai Final',
    'Nilai COD',
    'Sigesit',
    'Status Terakhir',
    'Status Final',
    'Status Transaksi',
  ];

  private static SupplierInvoiceHeader = [
    'Partner',
    'Awb Date',
    'Awb',
    'Package Amount',
    'Cod Amount',
    'Cod Fee',
    'Amount Transfer',
    'Pod Datetime',
    'Recipient',
    'Status Internal',
    'Tracking Status',
    'Cust Package',
    'Pickup Source',
    'Current Position',
    'Destination Code',
    'Destination',
    'Package Detail',
    'Services',
    'Note',
  ];

  private static CodHeaderFinance = [
    'Partner',
    'Awb Date',
    'Awb',
    'Package Amount',
    'Cod Amount',
    // 'Cod Fee',
    'Amount Transfer',
    'Pod Datetime',
    'Recipient',
    'Tipe Pembayaran',
    'Status Internal',
    'Tracking Status',
    'Cust Package',
    // 'Pickup Source',
    'Current Position',
    'Destination Code',
    // 'Destination',
    // 'Perwakilan',
    // 'Sigesit',
    'Package Detail',
    'Services',
    'Note',
    'Submitted Date',
    'Submitted Number',
    'Transfer Date',
    'Date Updated',
    // 'User Updated',
    'Awb Status Date',
  ];

  private static CodHeaderNominal = [
    'Awb Number',
    'Requestor Name',
    'Cod Value',
    'Cod Value Current',
    'Attachment Url',
    'Update Date',
  ];

  private static strReplaceFunc = str => {
    return str
      ? str
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/;/g, '|')
          .replace(/,/g, '.')
      : null;
  }

  private static streamTransformCodFee(d) {
    const values = [
      [
        V2WebCodReportService.strReplaceFunc(d.partnerName),
        d.awbDate ? moment(d.awbDate).format('YYYY-MM-DD HH:mm') : null,
        `'${d.awbNumber}`,
        d.parcelValue,
        d.codValue,
        d.codFee ? d.codFee : '-',
        d.codValue,
        d.podDate ? moment(d.podDate).format('YYYY-MM-DD HH:mm') : null,
        V2WebCodReportService.strReplaceFunc(d.consigneeName),
        V2WebCodReportService.strReplaceFunc(d.paymentMethod),
        'PAID',
        'DLV',
        V2WebCodReportService.strReplaceFunc(
          d.custPackage ? d.custPackage : '-',
        ),
        V2WebCodReportService.strReplaceFunc(d.pickupSource),
        V2WebCodReportService.strReplaceFunc(d.currentPosition),
        V2WebCodReportService.strReplaceFunc(d.destinationCode),
        V2WebCodReportService.strReplaceFunc(d.destination),
        V2WebCodReportService.strReplaceFunc(d.perwakilan),
        d.driver ? V2WebCodReportService.strReplaceFunc(d.driver) : '-',
        V2WebCodReportService.strReplaceFunc(d.parcelContent),
        V2WebCodReportService.strReplaceFunc(d.packageTypeCode),
        V2WebCodReportService.strReplaceFunc(d.parcelNote),
        '-',
        '-',
        d.updatedTime ? moment(d.updatedTime).format('YYYY-MM-DD HH:mm') : null,
        d.updUser ? d.updUser : '-',
      ],
    ];

    return `${values.join(',')} \n`;
  }

  private static streamTransformTransaction(doc) {
    const values = [
      V2WebCodReportService.strReplaceFunc(doc.partnerName),
      doc.awbDate ? moment(doc.awbDate).format('YYYY-MM-DD HH:mm') : null,
      `'${doc.awbNumber}`,
      doc.parcelValue,
      doc.codValue,
      doc.codFee ? doc.codFee : '-',
      doc.codValue,
      doc.podDate ? moment(doc.podDate).format('YYYY-MM-DD HH:mm') : null,
      V2WebCodReportService.strReplaceFunc(doc.consigneeName),
      doc.paymentMethod,
      doc.transactionStatus,
      doc.supplierInvoiceStatus,
      doc.trackingStatus,
      V2WebCodReportService.strReplaceFunc(
        doc.custPackage ? doc.custPackage : '-',
      ),
      V2WebCodReportService.strReplaceFunc(doc.pickupSource),
      V2WebCodReportService.strReplaceFunc(doc.currentPosition),
      V2WebCodReportService.strReplaceFunc(doc.destinationCode),
      V2WebCodReportService.strReplaceFunc(doc.destination),
      V2WebCodReportService.strReplaceFunc(doc.parcelContent),
      V2WebCodReportService.strReplaceFunc(doc.packageTypeCode),
      V2WebCodReportService.strReplaceFunc(doc.parcelNote),
      '-',
      '-',
      doc.updatedTime
        ? moment(doc.updatedTime).format('YYYY-MM-DD HH:mm')
        : null,
      doc.updUser ? doc.updUser : '-',
    ];

    return `${values.join(',')} \n`;
  }

  private static streamTransform(doc) {
    const values = [
      V2WebCodReportService.strReplaceFunc(doc.partnerName),
      doc.awbDate ? moment(doc.awbDate).format('YYYY-MM-DD HH:mm') : null,
      `'${doc.awbNumber}`,
      doc.parcelValue,
      doc.codValue,
      doc.codValue,
      doc.podDate ? moment(doc.podDate).format('YYYY-MM-DD HH:mm') : null,
      V2WebCodReportService.strReplaceFunc(doc.consigneeName),
      doc.paymentMethod,
      doc.transactionStatus,
      doc.supplierInvoiceStatus,
      doc.trackingStatus,
      V2WebCodReportService.strReplaceFunc(
        doc.custPackage ? doc.custPackage : '-',
      ),
      V2WebCodReportService.strReplaceFunc(doc.pickupSource),
      V2WebCodReportService.strReplaceFunc(doc.currentPosition),
      V2WebCodReportService.strReplaceFunc(doc.destinationCode),
      V2WebCodReportService.strReplaceFunc(doc.destination),
      V2WebCodReportService.strReplaceFunc(doc.perwakilan),
      doc.driver ? V2WebCodReportService.strReplaceFunc(doc.driver) : '-',
      V2WebCodReportService.strReplaceFunc(doc.parcelContent),
      V2WebCodReportService.strReplaceFunc(doc.packageTypeCode),
      V2WebCodReportService.strReplaceFunc(doc.parcelNote),
      '-',
      '-',
      doc.updatedTime
        ? moment(doc.updatedTime).format('YYYY-MM-DD HH:mm')
        : null,
      doc.updUser ? doc.updUser : '-',
    ];

    return `${values.join(',')} \n`;
  }

  private static streamTransformAwb(d) {
    const values = [
      [
        `'${d.awbNumber}`,
        d.manifestedDate ? moment(d.manifestedDate).format('YYYY-MM-DD') : null,
        d.transactionDate
          ? moment(d.transactionDate).format('YYYY-MM-DD HH:mm')
          : null,
        d.consigneeName
          ? V2WebCodReportService.strReplaceFunc(d.consigneeName)
          : '-',
        V2WebCodReportService.strReplaceFunc(d.packageTypeCode),
        V2WebCodReportService.strReplaceFunc(d.codPaymentMethod),
        V2WebCodReportService.strReplaceFunc(d.branchNameLast),
        V2WebCodReportService.strReplaceFunc(d.branchNameFinal),
        d.codValue ? `Rp. ${Number(d.codValue)}` : '-',
        d.driverName ? V2WebCodReportService.strReplaceFunc(d.driverName) : '-',
        V2WebCodReportService.strReplaceFunc(d.awbStatusLast),
        V2WebCodReportService.strReplaceFunc(d.awbStatusFinal),
        d.transactionStatusName
          ? V2WebCodReportService.strReplaceFunc(d.transactionStatusName)
          : '-',
      ],
    ];

    return `${values.join(',')} \n`;
  }

  private static streamTransformSupplierInvoice(d) {
    const values = [
      [
        V2WebCodReportService.strReplaceFunc(d.partnerName),
        d.awbDate ? moment(d.awbDate).format('YYYY-MM-DD') : null,
        V2WebCodReportService.strReplaceFunc(d.awbNumber),
        d.parcelValue,
        d.codValue,
        d.codFee,
        d.codValue,
        d.podDate ? moment(d.podDate).format('YYYY-MM-DD HH:mm') : null,
        V2WebCodReportService.strReplaceFunc(d.consigneeName),
        'DRAFT INVOICE', // supplier invoice status
        'DLV',
        V2WebCodReportService.strReplaceFunc(d.custPackage),
        V2WebCodReportService.strReplaceFunc(d.pickupSource),
        V2WebCodReportService.strReplaceFunc(d.currentPosition),
        V2WebCodReportService.strReplaceFunc(d.destinationCode),
        V2WebCodReportService.strReplaceFunc(d.destination),
        V2WebCodReportService.strReplaceFunc(d.parcelContent),
        V2WebCodReportService.strReplaceFunc(d.packageType),
        V2WebCodReportService.strReplaceFunc(d.parcelNote),
      ],
    ];

    return `${values.join(',')} \n`;
  }

  private static streamTransformCodFinance(d) {
    const values = [
      [
        V2WebCodReportService.strReplaceFunc(d.partnerName),
        d.awbDate ? moment(d.awbDate).format('YYYY-MM-DD HH:mm') : null,
        `'${d.awbNumber}`,
        d.parcelValue,
        d.codValue,
        // d.codFee ? d.codFee : '-',
        d.codValue,
        d.podDate ? moment(d.podDate).format('YYYY-MM-DD HH:mm') : null,
        V2WebCodReportService.strReplaceFunc(d.consigneeName),
        V2WebCodReportService.strReplaceFunc(d.paymentMethod),
        V2WebCodReportService.strReplaceFunc(d.transactionStatus),
        V2WebCodReportService.strReplaceFunc(d.awbStatusName),
        V2WebCodReportService.strReplaceFunc(
          d.custPackage ? d.custPackage : '-',
        ),
        // V2WebCodReportService.strReplaceFunc(d.pickupSource),
        V2WebCodReportService.strReplaceFunc(d.currentPosition),
        V2WebCodReportService.strReplaceFunc(d.destinationCode),
        // V2WebCodReportService.strReplaceFunc(d.destination),
        // V2WebCodReportService.strReplaceFunc(d.perwakilan),
        // d.driver ? V2WebCodReportService.strReplaceFunc(d.driver) : '-',
        V2WebCodReportService.strReplaceFunc(d.parcelContent),
        V2WebCodReportService.strReplaceFunc(d.packageTypeCode),
        V2WebCodReportService.strReplaceFunc(d.parcelNote),
        '-',
        '-',
        d.transferDate
          ? moment(d.transferDate).format('YYYY-MM-DD HH:mm')
          : null,
        d.updatedTime ? moment(d.updatedTime).format('YYYY-MM-DD HH:mm') : null,
        d.awbStatusDate
          ? moment(d.awbStatusDate).format('YYYY-MM-DD HH:mm')
          : null,
      ],
    ];

    return `${values.join(',')} \n`;
  }

  private static streamTransformCodNominal(d) {
    const values = [
      [
        `'${d.awbNumber}`,
        d.requestorName ? V2WebCodReportService.strReplaceFunc(d.requestorName) : '',
        d.codValue,
        d.codValueCurrent,
        d.attachmentUrl,
        d.updateDate ? moment(d.updateDate).format('YYYY-MM-DD HH:mm') : null,
      ],
    ];

    return `${values.join(',')} \n`;
  }
}
