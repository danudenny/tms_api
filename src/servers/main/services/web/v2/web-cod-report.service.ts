import fs = require('fs');
import * as moment from 'moment';
import * as path from 'path';
import _ = require('lodash');
import { AwsS3Service } from '../../../../../shared/services/aws-s3.service';
import { ConfigService } from '../../../../../shared/services/config.service';
import { MongoDbConfig } from '../../../config/database/mongodb.config';
import { ServiceUnavailableException } from '@nestjs/common/exceptions/service-unavailable.exception';
import { BadRequestException } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';

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

  // csv file code
  static async getCSVConfig(cod = true) {
    const csvHeaders: any = cod
      ? this.CodHeader
      : [
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
          'Status Invoice',
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

    const csvConfig = cod
      ? this.prepareCsvFile('COD', csvHeaders)
      : this.prepareCsvFile('COD_nonfee', csvHeaders);
    return csvConfig;
  }

  // TODO: add params for custom name file
  static prepareCsvFile(fn, headers): any {
    const appRoot = require('app-root-path');
    const uuidv1 = require('uuid/v1');
    const fileName =
      moment().format('YYYYMMDD') + '_' + fn + '_' + uuidv1() + '.csv';
    const basePath = path.join(appRoot.path, 'dist/public/temps');
    const filePath = basePath + '/' + fileName;
    const urlPath = 'public/temps/' + fileName;

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const csvConfig: any = {
      headers,
      separator: ',',
      newline: '\n',
    };

    const csvWriter = require('csv-write-stream');
    const writer = csvWriter(csvConfig);

    writer.pipe(fs.createWriteStream(filePath));
    writer.end();

    return {
      basePath,
      fileName,
      filePath,
      urlPath,
      config: csvConfig,
    };
  }

  static async populateDataCsv(
    writer,
    data,
    cod,
    draft: boolean = false,
  ): Promise<boolean> {
    let count = 0;
    if (data) {
      for (const d of data) {
        // writer.write(d);
        writer.write([
          this.strReplaceFunc(d.partnerName),
          d.awbDate ? moment.utc(d.awbDate).format('YYYY-MM-DD') : null,
          this.strReplaceFunc(d.awbNumber),
          d.parcelValue,
          d.codValue,
          d.codFee,
          d.codValue,
          d.podDate ? moment.utc(d.podDate).format('YYYY-MM-DD HH:mm') : null,
          this.strReplaceFunc(d.consigneeName),
          this.strReplaceFunc(d.paymentMethod),
          draft ? 'DRAFT INVOICE' : 'PAID', // supplier invoice status
          'DLV',
          this.strReplaceFunc(d.custPackage),
          this.strReplaceFunc(d.pickupSource),
          this.strReplaceFunc(d.currentPosition),
          this.strReplaceFunc(d.destinationCode),
          this.strReplaceFunc(d.destination),
          d.perwakilan,
          d.driver ? d.driver : '-',
          this.strReplaceFunc(d.parcelContent),
          this.strReplaceFunc(d.packageType),
          this.strReplaceFunc(d.parcelNote),
          '',
          '',
          d.dateUpdated
            ? moment.utc(d.dateUpdated).format('YYYY-MM-DD HH:mm')
            : null,
          d.updUser ? d.updUser : '-',
        ]);
      }
      count += 1;
    } // end of while
    writer.on('data', chunk => {
      // console.log(`Received ${chunk.length} bytes of data.`);
    });

    await this.sleep(100);
    return true;
  }

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

  static sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
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

  private static deleteFile(filePath) {
    return new Promise(async (resolve, reject) => {
      try {
        // remove file
        // console.log('Delete file success.');
        fs.unlinkSync(filePath);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
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

      // ['t1.branch_id_last', 'currentPositionId'],
      // ['t4.partner_id', 'partnerId'],
      // ['t1.awb_item_id', 'awbItemId'],
      // ['t1.awb_status_id_last', 'awbStatusIdLast'],
      // ['t2.to_id', 'destinationId'],
      // ['t2.package_type_id', 'packageTypeId'],
      // ['t5.package_type_name', 'packageTypeName'],
      // ['t2.branch_id_last', 'pickupSourceId'],
      // ['t2.total_weight_real_rounded', 'weightRealRounded'],
      // [`t2.total_weight_final_rounded`, 'weightFinalRounded'],
      // ['ctd.user_id_driver', 'userIdDriver'],
      // ['ctd.user_id_updated', 'userIdUpdated'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse())
      .andWhere(e => e.isCod, w => w.isTrue()),
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
    q.leftJoin(e => e.transactionStatus, 't10');
    q.leftJoin(e => e.codTransactionDetail.supplierInvoiceStatus, 't11');
    q.leftJoin(e => e.awbStatus, 't12');
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.awbStatusIdLast, w => w.isNotNull());
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

      // mapping field
      payload.fieldResolverMap['statusDate'] = 't1.updated_time';
      payload.fieldResolverMap['transactionDate'] = 'ctd.updated_time';
      payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
      payload.fieldResolverMap['supplier'] = 't6.partner_id';
      payload.fieldResolverMap['awbStatusId'] = 't1.awb_status_id_last';
      payload.fieldResolverMap['branchLastCode'] = 't7.branch_code';
      payload.fieldResolverMap['transactionStatus'] = 't1.transaction_status_id';
      payload.fieldResolverMap['supplierInvoiceStatus'] = 'ctd.supplier_invoice_status_id';
      payload.fieldResolverMap['sigesit'] = 'ctd.user_id_driver';

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

      // mapping field
      payload.fieldResolverMap['statusDate'] = 't1.updated_time';
      payload.fieldResolverMap['supplier'] = 't6.partner_id';

      await this.getReportData(payload, response, this.streamTransformCodFee);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async exportSupplierInvoice(id: string) {
    const dbMongo = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    const datarow = await dbMongo.find({ codSupplierInvoiceId: id }).toArray();

    const dataRowCount = datarow.length;
    console.log('## TOTAL DATA :: ', dataRowCount);
    if (!datarow || datarow.length <= 0) {
      throw new BadRequestException('Data belum lengkap, coba lagi nanti!');
    }

    try {
      const csvConfig = await this.getCSVConfig();
      const csvWriter = require('csv-write-stream');
      const writer = csvWriter(csvConfig.config);
      writer.pipe(fs.createWriteStream(csvConfig.filePath, { flags: 'a' }));

      await this.populateDataCsv(writer, datarow, true, true);
      writer.end();

      let url = '';
      const awsKey = `reports/cod/${csvConfig.fileName}`;
      const storagePath = await AwsS3Service.uploadFromFilePath(
        csvConfig.filePath,
        awsKey,
      );

      if (storagePath) {
        url = `${ConfigService.get('cloudStorage.cloudUrl')}/${
          storagePath.awsKey
        }`;
        this.deleteFile(csvConfig.filePath);
      }

      return { status: 'ok', url };
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }
}
