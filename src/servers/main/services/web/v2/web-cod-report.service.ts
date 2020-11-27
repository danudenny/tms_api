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

  static async getReportData(
    payload: BaseMetaPayloadVm,
    response,
    transformFn,
  ) {
    const repo = new OrionRepositoryService(AwbItemAttr, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['t6.partner_name', 'partnerName'],
      ['t2.awb_date', 'awbDate'],
      ['t1.awb_number', 'awbNumber'],
      ['t3.parcel_value', 'parcelValue'],
      ['t3.cod_value', 'codValue'],
      ['t1.awb_history_date_last', 'podDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['ctd.payment_method', 'paymentMethod'],
      ['t10.status_name', 'transactionStatus'],
      ['t11.status_name', 'supplierInvoiceStatus'],
      ['t12.awb_status_title', 'trackingStatus'],
      ['t4.reference_no', 'custPackage'],
      ['t8.branch_name', 'pickupSource'],
      ['t7.branch_name', 'currentPosition'],
      ['t2.ref_destination_code', 'destinationCode'],
      ['t9.district_name', 'destination'],
      ['branres.representative_code', 'perwakilan'],
      [`CONCAT(edriveruser.nik, ' - ', edriveruser.fullname)`, 'driver'],
      ['t3.parcel_content', 'parcelContent'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t3.notes', 'parcelNote'],
      ['ctd.updated_time', 'updatedTime'],
      [`CONCAT(eupduser.nik, ' - ', eupduser.fullname)`, 'updUser'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branchLast, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codTransactionDetail, 'ctd');

    q.innerJoin(e => e.codTransactionDetail.codTransaction, 'ct');
    q.leftJoin(e => e.branchLast.representative, 'branres');

    q.leftJoin(e => e.codTransactionDetail.userAdmin, 'upduser', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codTransactionDetail.userAdmin.employee, 'eupduser', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codTransactionDetail.userDriver, 'driveruser', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(
      e => e.codTransactionDetail.userDriver.employee,
      'edriveruser',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awb.branchLast, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awb.districtTo, 't9');

    q.leftJoin(e => e.transactionStatus, 't10', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codTransactionDetail.supplierInvoiceStatus, 't11', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbStatus, 't12', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    await q.stream(response, transformFn);
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

      await this.getReportData(payload, response, this.streamTransform);
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

      await this.getReportData(payload, response, this.streamTransformCodFee);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async exportSupplierInvoice(id: string, response) {
    try {
      const uuidv1 = require('uuid/v1');
      const fileName = moment().format('YYYYMMDD') + '_COD_' + uuidv1() + '.csv';
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
      q.andWhere(e => e.supplierInvoiceStatusId, w => w.equals(TRANSACTION_STATUS.DRAFT_INV));
      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformSupplierInvoice);
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }
}
