import * as moment from 'moment';
import { ServiceUnavailableException } from '@nestjs/common/exceptions/service-unavailable.exception';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';

export class V2WebCodReportService {
  static CodHeader = [
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

  static CodNONFeeHeader = [
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

  static SupplierInvoiceHeader = [
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

  static streamTransform(doc) {
    const values = [
      V2WebCodReportService.strReplaceFunc(doc.partnerName),
      doc.awbDate ? moment.utc(doc.awbDate).format('YYYY-MM-DD HH:mm') : null,
      `'${doc.awbNumber}`,
      doc.parcelValue,
      doc.codValue,
      doc.codFee ? doc.codFee : '-',
      doc.codValue,
      doc.podDate ? moment.utc(doc.podDate).format('YYYY-MM-DD HH:mm') : null,
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
      doc.driver ? doc.driver : '-',
      V2WebCodReportService.strReplaceFunc(doc.parcelContent),
      V2WebCodReportService.strReplaceFunc(doc.packageTypeCode),
      V2WebCodReportService.strReplaceFunc(doc.parcelNote),
      '-',
      '-',
      doc.updatedTime
        ? moment.utc(doc.updatedTime).format('YYYY-MM-DD HH:mm')
        : doc.updatedTime
        ? moment.utc(doc.updatedTime).format('YYYY-MM-DD HH:mm')
        : null,
      doc.updUser ? doc.updUser : '-',
    ];

    return `${values.join(',')} \n`;
  }

  static streamTransformCodFee(d) {
    const values = [
      [
        V2WebCodReportService.strReplaceFunc(d.partnerName),
        d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD HH:mm') : null,
        V2WebCodReportService.strReplaceFunc(d.awbNumber),
        d.parcelValue,
        d.codValue,
        d.codFee ? d.codFee : '-',
        d.codValue,
        d.podDate ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm') : null,
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
        d.driver ? d.driver : '-',
        V2WebCodReportService.strReplaceFunc(d.parcelContent),
        V2WebCodReportService.strReplaceFunc(d.packageTypeCode),
        V2WebCodReportService.strReplaceFunc(d.parcelNote),
        '-',
        '-',
        d.updatedTime
          ? moment.utc(d.updatedTime).format('YYYY-MM-DD HH:mm')
          : d.updatedTime
          ? moment.utc(d.updatedTime).format('YYYY-MM-DD HH:mm')
          : null,
        d.updUser ? d.updUser : '-',
      ],
    ];

    return `${values.join(',')} \n`;
  }

  static streamTransformSupplierInvoice(d) {
    const values = [
      [
        V2WebCodReportService.strReplaceFunc(d.partnerName),
        d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD') : null,
        V2WebCodReportService.strReplaceFunc(d.awbNumber),
        d.parcelValue,
        d.codValue,
        d.codFee,
        d.codValue,
        d.podDate ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm') : null,
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

  static strReplaceFunc = str => {
    return str
      ? str
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/;/g, '|')
          .replace(/,/g, '.')
      : null;
  }

  static async getReportFeeData(
    payload: BaseMetaPayloadVm,
    response,
    transformFn,
  ) {
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
      ['t10.status_name', 'transactionStatus'],
      ['t11.status_name', 'supplierInvoiceStatus'],
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
      ['t1.updated_time', 'awbStatusDate'],
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

    // Data Jika sudah ada transaksi
    q.innerJoin(e => e.codTransactionDetail, 'ctd', j =>
      j.andWhere(e => e.codTransactionId, w => w.isNotNull()),
    );

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

    // Transaction Status & Invoice Status
    q.leftJoin(e => e.transactionStatus, 't10');
    q.leftJoin(e => e.codTransactionDetail.supplierInvoiceStatus, 't11');

    // LAST STATUS
    q.leftJoin(e => e.awbStatus, 't12');

    // FINAL STATUS
    q.leftJoin(e => e.awbStatusFinal, 't13');

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    await q.stream(response, transformFn);
  }

  static async getReportNonfeeData(
    payload: BaseMetaPayloadVm,
    response,
    transformFn,
  ) {
    // mapping field
    payload.fieldResolverMap['statusDate'] = 't1.updated_time';
    payload.fieldResolverMap['transactionDate'] = 'ctd.updated_time';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['supplier'] = 't6.partner_id';
    payload.fieldResolverMap['awbStatusId'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['branchLastId'] = 't7.branch_id';
    payload.fieldResolverMap['transactionStatus'] = 't1.transaction_status_id';
    payload.fieldResolverMap['supplierInvoiceStatus'] =
      'ctd.supplier_invoice_status_id';
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
      ['t10.status_name', 'transactionStatus'],
      ['t11.status_name', 'supplierInvoiceStatus'],
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
      ['t1.updated_time', 'awbStatusDate'],
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

    // Data Jika sudah ada transaksi
    q.leftJoin(e => e.codTransactionDetail, 'ctd', j =>
      j.andWhere(e => e.codTransactionId, w => w.isNotNull()),
    );

    // Data Jika sudah dilakukan DLV - COD
    q.leftJoin(e => e.codPayment, 'cp');
    q.leftJoin(e => e.codPayment.branchFinal, 'fin');

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

    // Transaction Status & Invoice Status
    q.leftJoin(e => e.transactionStatus, 't10');
    q.leftJoin(e => e.codTransactionDetail.supplierInvoiceStatus, 't11');

    // LAST STATUS
    q.leftJoin(e => e.awbStatus, 't12');

    // FINAL STATUS
    q.leftJoin(e => e.awbStatusFinal, 't13');

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    await q.stream(response, transformFn);
  }

  static async printNonCodSupplierInvoice(
    payload: BaseMetaPayloadVm,
    response,
    exportType?: 'nonfee' | 'resicod',
  ) {
    try {
      let fileName = `COD_nonfee_${new Date().getTime()}.csv`;
      if (exportType === 'resicod') {
        fileName = `COD_daftarresi_${new Date().getTime()}.csv`;
      }

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.CodNONFeeHeader.join(',')}\n`);

      await this.getReportNonfeeData(payload, response, this.streamTransform);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

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

      await this.getReportFeeData(
        payload,
        response,
        this.streamTransformCodFee,
      );
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
}
